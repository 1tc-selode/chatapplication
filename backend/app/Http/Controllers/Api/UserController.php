<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of users (Admin only)
     */
    public function index(Request $request)
    {
        if (!$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only count private rooms
        $users = User::withCount(['rooms as rooms_count' => function ($query) {
            $query->where('is_private', true);
        }])->get();
        
        return response()->json($users);
    }

    /**
     * Display the specified user
     */
    public function show(Request $request, string $id)
    {
        if (!$request->user()->is_admin && $request->user()->id != $id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only load private rooms
        $user = User::with(['rooms' => function ($query) {
            $query->where('is_private', true)->with('category');
        }])->withCount(['rooms as rooms_count' => function ($query) {
            $query->where('is_private', true);
        }])->findOrFail($id);
        
        return response()->json($user);
    }

    /**
     * Update the specified user (Admin only)
     */
    public function update(Request $request, string $id)
    {
        if (!$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:8',
            'is_admin' => 'sometimes|boolean',
        ]);

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }

        if ($request->has('is_admin')) {
            $user->is_admin = $request->is_admin;
        }

        $user->save();

        return response()->json($user);
    }

    /**
     * Remove the specified user (Admin only)
     */
    public function destroy(Request $request, string $id)
    {
        if (!$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Cannot delete yourself
        if ($request->user()->id == $id) {
            return response()->json(['message' => 'Cannot delete yourself'], 400);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Assign room permissions to user (Admin only)
     */
    public function assignRoom(Request $request, string $userId)
    {
        if (!$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'room_id' => 'required|exists:rooms,id',
        ]);

        $user = User::findOrFail($userId);
        
        if (!$user->rooms()->where('room_id', $request->room_id)->exists()) {
            $user->rooms()->attach($request->room_id);
        }

        return response()->json(['message' => 'Room assigned successfully']);
    }

    /**
     * Remove room permissions from user (Admin only)
     */
    public function removeRoom(Request $request, string $userId)
    {
        if (!$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'room_id' => 'required|exists:rooms,id',
        ]);

        $user = User::findOrFail($userId);
        $user->rooms()->detach($request->room_id);

        return response()->json(['message' => 'Room access removed successfully']);
    }
}
