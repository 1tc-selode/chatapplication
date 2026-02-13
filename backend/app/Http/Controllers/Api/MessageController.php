<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Room;
use App\Events\MessageSent;
use App\Events\MessageDeleted;
use App\Events\MessageUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    /**
     * Display a listing of messages for a room.
     */
    public function index(Request $request, string $roomId)
    {
        $room = Room::findOrFail($roomId);
        
        // Check if user has access to room
        if ($room->is_private && !$room->users->contains($request->user()->id) && !$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $perPage = $request->get('per_page', 50);
        $messages = Message::where('room_id', $roomId)
            ->with(['user', 'reads.user'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($messages);
    }

    /**
     * Store a newly created message.
     */
    public function store(Request $request)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'content' => 'required|string',
            'file' => 'nullable|file|max:10240', // 10MB max
        ]);

        $room = Room::findOrFail($request->room_id);
        
        // Check if user has access to room
        if ($room->is_private && !$room->users->contains($request->user()->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messageData = [
            'room_id' => $request->room_id,
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ];

        // Handle file upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('messages', $fileName, 'public');
            
            $messageData['file_path'] = $filePath;
            $messageData['file_name'] = $file->getClientOriginalName();
        }

        $message = Message::create($messageData);
        $message->load('user');

        // Broadcast the message
        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message, 201);
    }

    /**
     * Display the specified message.
     */
    public function show(string $id)
    {
        $message = Message::with(['user', 'room', 'reads.user'])->findOrFail($id);
        return response()->json($message);
    }

    /**
     * Update the specified message.
     */
    public function update(Request $request, string $id)
    {
        $message = Message::findOrFail($id);

        // Only message owner can update
        if ($message->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'content' => 'required|string',
        ]);

        $message->update([
            'content' => $request->content,
            'is_edited' => true,
            'edited_at' => now(),
        ]);

        $message->load('user');

        // Broadcast the update
        broadcast(new MessageUpdated($message))->toOthers();

        return response()->json($message);
    }

    /**
     * Remove the specified message.
     */
    public function destroy(Request $request, string $id)
    {
        $message = Message::findOrFail($id);

        // Only message owner or admin can delete
        if ($message->user_id !== $request->user()->id && !$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete file if exists
        if ($message->file_path) {
            Storage::disk('public')->delete($message->file_path);
        }

        $roomId = $message->room_id;
        $messageId = $message->id;
        
        $message->delete();

        // Broadcast the deletion
        broadcast(new MessageDeleted($roomId, $messageId))->toOthers();

        return response()->json(['message' => 'Message deleted successfully']);
    }

    /**
     * Mark message as read
     */
    public function markAsRead(Request $request, string $id)
    {
        $message = Message::findOrFail($id);
        $user = $request->user();

        // Don't mark own messages as read
        if ($message->user_id === $user->id) {
            return response()->json(['message' => 'Cannot mark own message as read'], 400);
        }

        // Check if already read
        if ($message->readBy->contains($user->id)) {
            return response()->json(['message' => 'Already marked as read'], 400);
        }

        $message->readBy()->attach($user->id, ['read_at' => now()]);

        return response()->json([
            'message' => 'Marked as read',
            'reads' => $message->load('reads.user')->reads
        ]);
    }

    /**
     * Get unread message count for a room
     */
    public function unreadCount(Request $request, string $roomId)
    {
        $user = $request->user();
        
        $count = Message::where('room_id', $roomId)
            ->where('user_id', '!=', $user->id)
            ->whereDoesntHave('readBy', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->count();

        return response()->json(['count' => $count]);
    }
}
