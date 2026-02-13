<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'is_private',
    ];

    protected $casts = [
        'is_private' => 'boolean',
    ];

    /**
     * Get the category that owns the room.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the messages for the room.
     */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get the users that belong to the room.
     */
    public function users()
    {
        return $this->belongsToMany(User::class)->withTimestamps()->withPivot('joined_at');
    }
}
