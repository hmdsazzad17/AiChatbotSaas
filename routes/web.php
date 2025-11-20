<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Knowledge Management
    Route::get('/bots/{bot}/knowledge', [App\Http\Controllers\KnowledgeSourceController::class, 'index'])->name('knowledge.index');
    Route::get('/bots/{bot}/knowledge/create', [App\Http\Controllers\KnowledgeSourceController::class, 'create'])->name('knowledge.create');
    Route::post('/bots/{bot}/knowledge', [App\Http\Controllers\KnowledgeSourceController::class, 'store'])->name('knowledge.store');

    // Bot Management
    Route::resource('bots', App\Http\Controllers\BotController::class);

    // Inbox
    Route::get('/inbox', [App\Http\Controllers\InboxController::class, 'index'])->name('inbox.index');
    Route::get('/inbox/{conversation}', [App\Http\Controllers\InboxController::class, 'show'])->name('inbox.show');

    // Integrations
    Route::get('/integrations', function() {
        $bots = auth()->user()->bots;
        return Inertia::render('Integrations/Index', ['bots' => $bots]);
    })->name('integrations.index');
});
