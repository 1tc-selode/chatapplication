<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Room;
use App\Models\Message;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@chat.com',
            'password' => Hash::make('password'),
            'is_admin' => true,
        ]);

        // Create regular users
        $user1 = User::create([
            'name' => 'John Doe',
            'email' => 'john@chat.com',
            'password' => Hash::make('password'),
        ]);

        $user2 = User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@chat.com',
            'password' => Hash::make('password'),
        ]);

        // Create categories
        $general = Category::create([
            'name' => 'General',
            'description' => 'General discussion topics',
        ]);

        $tech = Category::create([
            'name' => 'Technology',
            'description' => 'Tech related discussions',
        ]);

        $random = Category::create([
            'name' => 'Random',
            'description' => 'Random chat',
        ]);

        // Create rooms
        $generalRoom = Room::create([
            'category_id' => $general->id,
            'name' => 'Welcome',
            'description' => 'Welcome to the chat!',
            'is_private' => false,
        ]);

        $announcementsRoom = Room::create([
            'category_id' => $general->id,
            'name' => 'Announcements',
            'description' => 'Important announcements',
            'is_private' => false,
        ]);

        $webdevRoom = Room::create([
            'category_id' => $tech->id,
            'name' => 'Web Development',
            'description' => 'Discuss web development',
            'is_private' => false,
        ]);

        $angularRoom = Room::create([
            'category_id' => $tech->id,
            'name' => 'Angular',
            'description' => 'Angular framework discussions',
            'is_private' => false,
        ]);

        $laravelRoom = Room::create([
            'category_id' => $tech->id,
            'name' => 'Laravel',
            'description' => 'Laravel framework discussions',
            'is_private' => false,
        ]);

        $privateRoom = Room::create([
            'category_id' => $general->id,
            'name' => 'Private Chat',
            'description' => 'Private room for selected users',
            'is_private' => true,
        ]);

        // Attach users to rooms
        $generalRoom->users()->attach([$admin->id, $user1->id, $user2->id]);
        $announcementsRoom->users()->attach([$admin->id, $user1->id, $user2->id]);
        $webdevRoom->users()->attach([$admin->id, $user1->id]);
        $angularRoom->users()->attach([$admin->id, $user2->id]);
        $laravelRoom->users()->attach([$admin->id, $user1->id, $user2->id]);
        $privateRoom->users()->attach([$admin->id, $user1->id]);

        // Create some messages
        Message::create([
            'room_id' => $generalRoom->id,
            'user_id' => $admin->id,
            'content' => 'Welcome to our chat application! Feel free to explore.',
        ]);

        Message::create([
            'room_id' => $generalRoom->id,
            'user_id' => $user1->id,
            'content' => 'Thanks! This looks great!',
        ]);

        Message::create([
            'room_id' => $webdevRoom->id,
            'user_id' => $admin->id,
            'content' => 'Let\'s discuss the latest web development trends.',
        ]);

        Message::create([
            'room_id' => $angularRoom->id,
            'user_id' => $user2->id,
            'content' => 'Angular 16 has some amazing new features!',
        ]);

        Message::create([
            'room_id' => $laravelRoom->id,
            'user_id' => $user1->id,
            'content' => 'Laravel 11 is awesome for building APIs!',
        ]);
    }
}
