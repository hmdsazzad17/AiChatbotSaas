<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['bot_id', 'platform', 'external_user_id'];

    public function bot()
    {
        return $this->belongsTo(Bot::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
