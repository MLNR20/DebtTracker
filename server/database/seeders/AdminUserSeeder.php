<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        $roleId = Role::where('role_name', Role::ADMIN_NAME)->value('role_id');

        User::updateOrCreate(
            ['user_name' => 'admin'],
            [
                'role_id' => $roleId,
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email_address' => 'admin@example.com',
                'password' => Hash::make('Password123!'),
                'is_active' => true,
            ]
        );
    }
}
