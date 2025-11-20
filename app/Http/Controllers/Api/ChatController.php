<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bot;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\GeminiService;
use App\Services\VectorStore\VectorStoreInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    protected $geminiService;
    protected $vectorStore;

    public function __construct(GeminiService $geminiService, VectorStoreInterface $vectorStore)
    {
        $this->geminiService = $geminiService;
        $this->vectorStore = $vectorStore;
    }

    public function incoming(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'bot_token' => 'required|exists:bots,access_token',
            'external_user_id' => 'required|string',
            'platform' => 'required|string|in:web,fb,wa',
        ]);

        try {
            // 1. Identify Bot
            $bot = Bot::where('access_token', $request->bot_token)->firstOrFail();

            // 2. Find or Create Conversation
            $conversation = Conversation::firstOrCreate(
                [
                    'bot_id' => $bot->id,
                    'platform' => $request->platform,
                    'external_user_id' => $request->external_user_id,
                ]
            );

            // 3. Save User Message
            $conversation->messages()->create([
                'sender' => 'user',
                'content' => $request->message,
            ]);

            // 4. RAG: Retrieve Context
            $context = "";
            $embedding = $this->geminiService->embedText($request->message);

            if (!empty($embedding)) {
                // Query Vector DB for top 3 matches
                $matches = $this->vectorStore->query($embedding, 3, ['bot_id' => $bot->id]);
                
                if (!empty($matches)) {
                    $contextParts = [];
                    foreach ($matches as $match) {
                        if (isset($match['metadata']['text'])) {
                            $contextParts[] = $match['metadata']['text'];
                        }
                    }
                    $context = implode("\n\n", $contextParts);
                }
            }

            // 5. Build Prompt
            // Fetch last 3 messages for history
            $history = $conversation->messages()
                ->latest()
                ->take(3)
                ->get()
                ->reverse()
                ->map(function ($msg) {
                    return ucfirst($msg->sender) . ": " . $msg->content;
                })
                ->implode("\n");

            $systemPrompt = $bot->role_instruction ?? "You are a helpful AI assistant.";
            
            $finalPrompt = "System: {$systemPrompt}\n\n";
            if (!empty($context)) {
                $finalPrompt .= "Context (Use this to answer if relevant):\n{$context}\n\n";
            }
            $finalPrompt .= "Chat History:\n{$history}\n\n";
            $finalPrompt .= "User: {$request->message}\n";
            $finalPrompt .= "Assistant:";

            // 6. Generate Response
            $aiResponse = $this->geminiService->generateCompletion($finalPrompt);

            // 7. Save AI Response
            $conversation->messages()->create([
                'sender' => 'bot',
                'content' => $aiResponse,
            ]);

            return response()->json([
                'response' => $aiResponse,
                'conversation_id' => $conversation->id
            ]);

        } catch (\Exception $e) {
            Log::error('Chat Error: ' . $e->getMessage());
            return response()->json(['error' => 'Something went wrong processing your request.'], 500);
        }
    }
}
