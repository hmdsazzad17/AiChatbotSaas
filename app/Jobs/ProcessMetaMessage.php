<?php

namespace App\Jobs;

use App\Models\Bot;
use App\Models\Conversation;
use App\Services\GeminiService;
use App\Services\VectorStore\VectorStoreInterface;
use GuzzleHttp\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessMetaMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $event;
    protected $platform;
    protected $context;

    public function __construct($event, $platform, $context = [])
    {
        $this->event = $event;
        $this->platform = $platform;
        $this->context = $context;
    }

    public function handle(GeminiService $geminiService, VectorStoreInterface $vectorStore)
    {
        try {
            if ($this->platform === 'messenger') {
                $this->handleMessenger($geminiService, $vectorStore);
            } elseif ($this->platform === 'whatsapp') {
                $this->handleWhatsApp($geminiService, $vectorStore);
            }
        } catch (\Exception $e) {
            Log::error('ProcessMetaMessage Error: ' . $e->getMessage(), [
                'event' => $this->event,
                'platform' => $this->platform
            ]);
        }
    }

    protected function handleMessenger($geminiService, $vectorStore)
    {
        $senderId = $this->event['sender']['id'];
        $recipientId = $this->event['recipient']['id']; // Page ID
        $messageText = $this->event['message']['text'];

        // Find bot by Page ID (you'll need to store page_id in bots table or use a mapping table)
        // For now, using first bot as fallback
        $bot = Bot::first();

        if (!$bot) {
            Log::error('No bot found for Messenger');
            return;
        }

        $response = $this->processMessage($bot, $senderId, $messageText, 'fb', $geminiService, $vectorStore);

        $this->sendMessengerMessage($senderId, $response);
    }

    protected function handleWhatsApp($geminiService, $vectorStore)
    {
        $senderId = $this->event['from'];
        $messageText = $this->event['text']['body'] ?? '';

        if (empty($messageText)) {
            return;
        }

        // Similar to Messenger, find appropriate bot
        $bot = Bot::first();

        if (!$bot) {
            Log::error('No bot found for WhatsApp');
            return;
        }

        $response = $this->processMessage($bot, $senderId, $messageText, 'wa', $geminiService, $vectorStore);

        $this->sendWhatsAppMessage($senderId, $response);
    }

    protected function processMessage($bot, $externalUserId, $messageText, $platform, $geminiService, $vectorStore)
    {
        // Find or create conversation
        $conversation = Conversation::firstOrCreate([
            'bot_id' => $bot->id,
            'platform' => $platform,
            'external_user_id' => $externalUserId,
        ]);

        // Save user message
        $conversation->messages()->create([
            'sender' => 'user',
            'content' => $messageText,
        ]);

        // RAG: Retrieve context
        $context = "";
        $embedding = $geminiService->embedText($messageText);

        if (!empty($embedding)) {
            $matches = $vectorStore->query($embedding, 3, ['bot_id' => $bot->id]);
            
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

        // Build prompt with history
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
            $finalPrompt .= "Context:\n{$context}\n\n";
        }
        $finalPrompt .= "History:\n{$history}\n\n";
        $finalPrompt .= "User: {$messageText}\nAssistant:";

        // Generate response
        $aiResponse = $geminiService->generateCompletion($finalPrompt);

        // Save AI response
        $conversation->messages()->create([
            'sender' => 'bot',
            'content' => $aiResponse,
        ]);

        return $aiResponse;
    }

    protected function sendMessengerMessage($recipientId, $text)
    {
        $accessToken = config('services.meta.page_access_token');
        $url = "https://graph.facebook.com/v18.0/me/messages?access_token={$accessToken}";

        $client = new Client();
        
        try {
            $client->post($url, [
                'json' => [
                    'recipient' => ['id' => $recipientId],
                    'message' => ['text' => $text]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Messenger Send Error: ' . $e->getMessage());
        }
    }

    protected function sendWhatsAppMessage($recipientId, $text)
    {
        $accessToken = config('services.meta.whatsapp_token');
        $phoneNumberId = config('services.meta.whatsapp_phone_number_id');
        $url = "https://graph.facebook.com/v18.0/{$phoneNumberId}/messages";

        $client = new Client();
        
        try {
            $client->post($url, [
                'headers' => [
                    'Authorization' => "Bearer {$accessToken}",
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'messaging_product' => 'whatsapp',
                    'to' => $recipientId,
                    'text' => ['body' => $text]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('WhatsApp Send Error: ' . $e->getMessage());
        }
    }
}
