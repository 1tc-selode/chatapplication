<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\UserController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/status', [AuthController::class, 'updateOnlineStatus']);
    
    // Category routes
    Route::apiResource('categories', CategoryController::class);
    
    // Room routes
    Route::apiResource('rooms', RoomController::class);
    Route::post('/rooms/{id}/join', [RoomController::class, 'join']);
    Route::post('/rooms/{id}/leave', [RoomController::class, 'leave']);
    Route::get('/rooms/{id}/users', [RoomController::class, 'users']);
    
    // Message routes
    Route::get('/rooms/{roomId}/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages/{id}', [MessageController::class, 'show']);
    Route::put('/messages/{id}', [MessageController::class, 'update']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);
    Route::post('/messages/{id}/read', [MessageController::class, 'markAsRead']);
    Route::get('/rooms/{roomId}/messages/unread', [MessageController::class, 'unreadCount']);
    
    // User management routes (Admin only)
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/users/{userId}/assign-room', [UserController::class, 'assignRoom']);
    Route::post('/users/{userId}/remove-room', [UserController::class, 'removeRoom']);
});
