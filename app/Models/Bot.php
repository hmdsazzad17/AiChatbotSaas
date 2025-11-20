<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bot extends Model
{
    protected $fillable = ['user_id', 'name', 'role_instruction', 'access_token'];

    public function knowledgeSources()
    {
        return $this->hasMany(KnowledgeSource::class);
    }
}
