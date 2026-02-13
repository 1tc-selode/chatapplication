<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MessageRead extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'user_id',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Get the message that owns the read receipt.
     */
    public function message()
    {
        return $this->belongsTo(Message::class);
    }

    /**
     * Get the user that owns the read receipt.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
