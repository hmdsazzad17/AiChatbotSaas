<?php

namespace App\Services\VectorStore;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class PineconeService implements VectorStoreInterface
{
    protected $client;
    protected $apiKey;
    protected $host;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = config('services.pinecone.api_key');
        $this->host = config('services.pinecone.host'); // e.g., https://index-name-project-id.svc.environment.pinecone.io
    }

    public function upsert(array $vectors): bool
    {
        $url = "{$this->host}/vectors/upsert";

        try {
            $response = $this->client->post($url, [
                'headers' => [
                    'Api-Key' => $this->apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'vectors' => $vectors
                ]
            ]);

            return $response->getStatusCode() === 200;

        } catch (\Exception $e) {
            Log::error('Pinecone Upsert Exception: ' . $e->getMessage());
            return false;
        }
    }

    public function query(array $vector, int $topK = 3, array $filter = []): array
    {
        $url = "{$this->host}/query";

        try {
            $payload = [
                'vector' => $vector,
                'topK' => $topK,
                'includeMetadata' => true,
            ];

            if (!empty($filter)) {
                $payload['filter'] = $filter;
            }

            $response = $this->client->post($url, [
                'headers' => [
                    'Api-Key' => $this->apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => $payload
            ]);

            $data = json_decode($response->getBody(), true);

            return $data['matches'] ?? [];

        } catch (\Exception $e) {
            Log::error('Pinecone Query Exception: ' . $e->getMessage());
            return [];
        }
    }
}
