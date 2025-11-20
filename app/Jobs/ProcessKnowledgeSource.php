<?php

namespace App\Jobs;

use App\Models\KnowledgeSource;
use App\Services\GeminiService;
use App\Services\VectorStore\VectorStoreInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser;

class ProcessKnowledgeSource implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $knowledgeSource;

    /**
     * Create a new job instance.
     */
    public function __construct(KnowledgeSource $knowledgeSource)
    {
        $this->knowledgeSource = $knowledgeSource;
    }

    /**
     * Execute the job.
     */
    public function handle(GeminiService $geminiService, VectorStoreInterface $vectorStore): void
    {
        Log::info("Starting processing for KnowledgeSource ID: {$this->knowledgeSource->id}, Type: {$this->knowledgeSource->type}");
        $this->knowledgeSource->update(['status' => 'processing']);

        try {
            $text = '';

            if ($this->knowledgeSource->type === 'pdf') {
                // source_uri holds the storage path
                $path = Storage::disk('local')->path($this->knowledgeSource->source_uri);
                Log::info("Processing PDF at path: {$path}");
                
                if (file_exists($path)) {
                    $parser = new Parser();
                    $pdf = $parser->parseFile($path);
                    $text = $pdf->getText();
                    Log::info("PDF text extracted. Length: " . strlen($text));
                } else {
                    throw new \Exception("PDF file not found at: {$path}");
                }
            } elseif ($this->knowledgeSource->type === 'url') {
                Log::info("Processing URL: {$this->knowledgeSource->source_uri}");
                $html = file_get_contents($this->knowledgeSource->source_uri);
                $text = strip_tags($html); 
                Log::info("URL text extracted. Length: " . strlen($text));
            } else {
                $text = $this->knowledgeSource->content_text;
                Log::info("Processing raw text. Length: " . strlen($text));
            }

            // Chunking
            $chunks = str_split($text, 500);
            Log::info("Text split into " . count($chunks) . " chunks.");
            
            $vectors = [];

            foreach ($chunks as $index => $chunk) {
                $embedding = $geminiService->embedText($chunk);
                if (!empty($embedding)) {
                    $vectors[] = [
                        'id' => "{$this->knowledgeSource->id}_{$index}",
                        'values' => $embedding,
                        'metadata' => [
                            'bot_id' => $this->knowledgeSource->bot_id,
                            'source_id' => $this->knowledgeSource->id,
                            'text' => $chunk
                        ]
                    ];
                }
            }
            
            Log::info("Generated " . count($vectors) . " embeddings.");

            if (!empty($vectors)) {
                if (!$vectorStore->upsert($vectors)) {
                    throw new \Exception("Failed to upsert vectors to Pinecone.");
                }
                Log::info("Vectors upserted to Pinecone.");
            }

            $this->knowledgeSource->update(['status' => 'indexed', 'content_text' => $text]);
            Log::info("KnowledgeSource ID: {$this->knowledgeSource->id} processing complete.");

        } catch (\Exception $e) {
            Log::error('Processing Knowledge Source Failed: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            $this->knowledgeSource->update(['status' => 'failed']);
        }
    }
}
