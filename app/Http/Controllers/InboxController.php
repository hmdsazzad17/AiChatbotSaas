<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InboxController extends Controller
{
    public function index(Request $request)
    {
        $query = Conversation::whereHas('bot', function($q) {
            $q->where('user_id', auth()->id());
        })->with(['bot', 'messages' => function($q) {
            $q->latest()->limit(1);
        }]);

        if ($request->has('bot_id')) {
            $query->where('bot_id', $request->bot_id);
        }

        $conversations = $query->latest()->paginate(20);

        $bots = auth()->user()->bots;

        return Inertia::render('Inbox/Index', [
            'conversations' => $conversations,
            'bots' => $bots
        ]);
    }

    public function show(Conversation $conversation)
    {
        $conversation->load(['bot', 'messages']);

        // Ensure user owns the bot
        if ($conversation->bot->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Inbox/Show', [
            'conversation' => $conversation
        ]);
    }
}
