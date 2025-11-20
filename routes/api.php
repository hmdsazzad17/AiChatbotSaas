<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/chat/incoming', [App\Http\Controllers\Api\ChatController::class, 'incoming']);

// Meta Webhooks
Route::get('/webhooks/meta', [App\Http\Controllers\WebhookController::class, 'verifyMeta']);
Route::post('/webhooks/meta', [App\Http\Controllers\WebhookController::class, 'handleMeta']);
