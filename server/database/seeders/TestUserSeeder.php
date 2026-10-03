<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    public function run()
    {
        $roleId = Role::where('role_name', 'User')->value('role_id');

        User::updateOrCreate(
            ['user_name' => 'testuser'],
            [
                'role_id' => $roleId,
                'first_name' => 'Test',
                'last_name' => 'User',
                'email_address' => 'testuser@example.com',
                'password' => Hash::make('Password123!'),
                'is_active' => true,
            ]
        );
    }
}
