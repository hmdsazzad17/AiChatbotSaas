<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected $client;
    protected $apiKey;
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = config('services.gemini.api_key');
    }

    /**
     * Generate embeddings for a given text.
     *
     * @param string $text
     * @return array
     */
    public function embedText(string $text): array
    {
        $model = 'models/text-embedding-004';
        $url = "{$this->baseUrl}/{$model}:embedContent?key={$this->apiKey}";

        try {
            $response = $this->client->post($url, [
                'json' => [
                    'model' => $model,
                    'content' => [
                        'parts' => [
                            ['text' => $text]
                        ]
                    ]
                ]
            ]);

            $data = json_decode($response->getBody(), true);

            if (isset($data['embedding']['values'])) {
                return $data['embedding']['values'];
            }

            Log::error('Gemini Embedding Error: Invalid response structure', ['response' => $data]);
            return [];

        } catch (\Exception $e) {
            Log::error('Gemini Embedding Exception: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Generate a completion (chat response) for a given prompt.
     *
     * @param string $prompt
     * @return string
     */
    public function generateCompletion(string $prompt): string
    {
        $model = 'models/gemini-2.5-flash-lite';
        $url = "{$this->baseUrl}/{$model}:generateContent?key={$this->apiKey}";

        try {
            $response = $this->client->post($url, [
                'json' => [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ]
                ]
            ]);

            $data = json_decode($response->getBody(), true);

            if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                return $data['candidates'][0]['content']['parts'][0]['text'];
            }

            Log::error('Gemini Completion Error: Invalid response structure', ['response' => $data]);
            return "I'm sorry, I couldn't generate a response at this time.";

        } catch (\Exception $e) {
            Log::error('Gemini Completion Exception: ' . $e->getMessage());
            return "I'm sorry, I encountered an error while processing your request.";
        }
    }
}
