<?php

namespace App\Services\VectorStore;

interface VectorStoreInterface
{
    /**
     * Upsert vectors into the database.
     *
     * @param array $vectors Array of vectors with id, values, and metadata.
     * @return bool
     */
    public function upsert(array $vectors): bool;

    /**
     * Query the vector database for similar vectors.
     *
     * @param array $vector The query vector.
     * @param int $topK Number of results to return.
     * @param array $filter Optional metadata filters.
     * @return array
     */
    public function query(array $vector, int $topK = 3, array $filter = []): array;
}
