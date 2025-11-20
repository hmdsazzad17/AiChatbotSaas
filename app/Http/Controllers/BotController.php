<?php

namespace App\Http\Controllers;

use App\Models\Bot;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BotController extends Controller
{
    public function index()
    {
        $bots = auth()->user()->bots()->latest()->get();
        
        return Inertia::render('Bots/Index', [
            'bots' => $bots
        ]);
    }

    public function create()
    {
        return Inertia::render('Bots/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role_instruction' => 'nullable|string',
        ]);

        $bot = auth()->user()->bots()->create([
            'name' => $request->name,
            'role_instruction' => $request->role_instruction ?? 'You are a helpful AI assistant.',
            'access_token' => Str::uuid(),
        ]);

        return redirect()->route('bots.index')->with('success', 'Bot created successfully!');
    }

    public function show(Bot $bot)
    {
        $this->authorize('view', $bot);
        
        return Inertia::render('Bots/Show', [
            'bot' => $bot->load('knowledgeSources')
        ]);
    }

    public function edit(Bot $bot)
    {
        $this->authorize('update', $bot);
        
        return Inertia::render('Bots/Edit', [
            'bot' => $bot
        ]);
    }

    public function update(Request $request, Bot $bot)
    {
        $this->authorize('update', $bot);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'role_instruction' => 'nullable|string',
        ]);

        $bot->update([
            'name' => $request->name,
            'role_instruction' => $request->role_instruction,
        ]);

        return redirect()->route('bots.index')->with('success', 'Bot updated successfully!');
    }

    public function destroy(Bot $bot)
    {
        $this->authorize('delete', $bot);
        
        $bot->delete();

        return redirect()->route('bots.index')->with('success', 'Bot deleted successfully!');
    }
}
