<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessMetaMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Verify webhook (Facebook requirement)
     */
    public function verifyMeta(Request $request)
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        $verifyToken = config('services.meta.verify_token');

        if ($mode === 'subscribe' && $token === $verifyToken) {
            Log::info('Meta Webhook verified successfully');
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        Log::warning('Meta Webhook verification failed', [
            'mode' => $mode,
            'token' => $token
        ]);

        return response('Forbidden', 403);
    }

    /**
     * Handle incoming webhook events
     */
    public function handleMeta(Request $request)
    {
        $data = $request->all();

        Log::info('Meta Webhook received', ['payload' => $data]);

        // Respond immediately to Facebook (they expect quick response)
        // Then process asynchronously
        dispatch(function() use ($data) {
            if (!isset($data['entry'])) {
                return;
            }

            foreach ($data['entry'] as $entry) {
                // Handle Messenger
                if (isset($entry['messaging'])) {
                    foreach ($entry['messaging'] as $event) {
                        if (isset($event['message']) && isset($event['message']['text'])) {
                            ProcessMetaMessage::dispatch($event, 'messenger');
                        }
                    }
                }

                // Handle WhatsApp
                if (isset($entry['changes'])) {
                    foreach ($entry['changes'] as $change) {
                        if (isset($change['value']['messages'])) {
                            foreach ($change['value']['messages'] as $message) {
                                ProcessMetaMessage::dispatch($message, 'whatsapp', $change['value'] ?? []);
                            }
                        }
                    }
                }
            }
        });

        return response()->json(['status' => 'ok']);
    }
}
