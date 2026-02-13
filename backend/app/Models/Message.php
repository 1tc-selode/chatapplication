<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'user_id',
        'content',
        'file_path',
        'file_name',
        'is_edited',
        'edited_at',
    ];

    protected $casts = [
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
    ];

    protected $with = ['user'];

    /**
     * Get the room that owns the message.
     */
    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get the user that owns the message.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the users who have read the message.
     */
    public function readBy()
    {
        return $this->belongsToMany(User::class, 'message_reads')->withTimestamps()->withPivot('read_at');
    }

    /**
     * Get the read receipts for the message.
     */
    public function reads()
    {
        return $this->hasMany(MessageRead::class);
    }
}
