<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Room;

Broadcast::channel('room.{roomId}', function ($user, $roomId) {
    $room = Room::find($roomId);
    
    if (!$room) {
        return false;
    }
    
    // Allow access if room is public or user is in the room or user is admin
    return !$room->is_private || 
           $room->users->contains($user->id) || 
           $user->is_admin;
});

Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
