<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get all public rooms and private rooms the user has access to
        $rooms = Room::with(['category', 'users'])
            ->where(function ($query) use ($user) {
                $query->where('is_private', false)
                    ->orWhereHas('users', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
            })
            ->get();

        return response()->json($rooms);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Only admin can create rooms
        if (!$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_private' => 'boolean',
        ]);

        $room = Room::create($request->all());
        
        // Automatically assign the admin who created the room
        $room->users()->attach($request->user()->id);

        return response()->json($room->load('category'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $room = Room::with(['category', 'users'])->findOrFail($id);
        
        // Check if user has access to private room
        if ($room->is_private && !$room->users->contains($request->user()->id) && !$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($room);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Only admin can update rooms
        if (!$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $room = Room::findOrFail($id);

        $request->validate([
            'category_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_private' => 'boolean',
        ]);

        $room->update($request->all());

        return response()->json($room->load('category'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        // Only admin can delete rooms
        if (!$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $room = Room::findOrFail($id);
        $room->delete();

        return response()->json(['message' => 'Room deleted successfully']);
    }

    /**
     * Join a room
     */
    public function join(Request $request, string $id)
    {
        $room = Room::findOrFail($id);
        $user = $request->user();

        // Check if room is private and user has permission
        if ($room->is_private && !$user->is_admin) {
            return response()->json(['message' => 'Cannot join private room'], 403);
        }

        // Check if user is already in the room
        if ($room->users->contains($user->id)) {
            return response()->json(['message' => 'Already in room'], 400);
        }

        $room->users()->attach($user->id, ['joined_at' => now()]);

        return response()->json([
            'message' => 'Joined room successfully',
            'room' => $room->load('users')
        ]);
    }

    /**
     * Leave a room
     */
    public function leave(Request $request, string $id)
    {
        $room = Room::findOrFail($id);
        $user = $request->user();

        $room->users()->detach($user->id);

        return response()->json(['message' => 'Left room successfully']);
    }

    /**
     * Get room users
     */
    public function users(string $id)
    {
        $room = Room::findOrFail($id);
        
        // If the room is public, return all users
        if (!$room->is_private) {
            $users = \App\Models\User::select('id', 'name', 'email', 'is_admin', 'is_online', 'last_seen_at')->get();
        } else {
            // If the room is private, return only assigned users
            $users = $room->users;
        }
        
        return response()->json($users);
    }
}
