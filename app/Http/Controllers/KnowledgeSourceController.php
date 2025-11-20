<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessKnowledgeSource;
use App\Models\Bot;
use App\Models\KnowledgeSource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KnowledgeSourceController extends Controller
{
    public function index(Bot $bot)
    {
        return Inertia::render('Knowledge/Index', [
            'bot' => $bot,
            'sources' => $bot->knowledgeSources()->latest()->paginate(10),
        ]);
    }

    public function create(Bot $bot)
    {
        return Inertia::render('Knowledge/Create', [
            'bot' => $bot,
        ]);
    }

    public function store(Request $request, Bot $bot)
    {
        \Illuminate\Support\Facades\Log::info('KnowledgeSource Store Request:', $request->all());
        
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'type' => 'required|in:text,url,pdf',
            'content_text' => 'required_if:type,text',
            'source_uri' => 'required_if:type,url',
            'file' => 'nullable|required_if:type,pdf|file|mimes:pdf|max:10240', // 10MB max
        ]);

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::error('KnowledgeSource Validation Failed:', $validator->errors()->toArray());
            return back()->withErrors($validator)->withInput();
        }

        $sourceData = [
            'bot_id' => $bot->id,
            'type' => $request->type,
            'status' => 'pending',
        ];

        if ($request->type === 'text') {
            $sourceData['content_text'] = $request->content_text;
        } elseif ($request->type === 'url') {
            $sourceData['source_uri'] = $request->source_uri;
        } elseif ($request->type === 'pdf') {
            if ($request->hasFile('file')) {
                $path = $request->file('file')->store('knowledge_sources');
                $sourceData['source_uri'] = $path;
            }
        }

        $source = KnowledgeSource::create($sourceData);

        // Dispatch Job
        ProcessKnowledgeSource::dispatch($source);

        return redirect()->route('knowledge.index', $bot->id)->with('success', 'Knowledge source added and processing started.');
    }
}
