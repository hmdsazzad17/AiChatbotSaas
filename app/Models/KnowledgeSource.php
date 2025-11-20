<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KnowledgeSource extends Model
{
    protected $fillable = ['bot_id', 'type', 'status', 'content_text', 'source_uri'];
}
