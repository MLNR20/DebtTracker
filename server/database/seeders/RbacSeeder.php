<?php

namespace Database\Seeders;

use App\Models\Page;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RbacSeeder extends Seeder
{
    /**
     * The built-in page catalogue. page_key is what the API middleware checks
     * (`page:<key>`); page_path is the client route.
     *
     * @return array<int, array{page_key: string, page_name: string, page_path: string, page_group: string, default: bool}>
     */
    public static function catalogue(): array
    {
        return [
            ['page_key' => 'dashboard', 'page_name' => 'Dashboard', 'page_path' => '/dashboard', 'page_group' => 'Overview', 'default' => true],
            ['page_key' => 'schedule', 'page_name' => 'Schedule', 'page_path' => '/schedule', 'page_group' => 'Overview', 'default' => true],
            ['page_key' => 'history', 'page_name' => 'History', 'page_path' => '/history', 'page_group' => 'Overview', 'default' => true],
            ['page_key' => 'roles', 'page_name' => 'Roles', 'page_path' => '/roles', 'page_group' => 'Access', 'default' => false],
            ['page_key' => 'pages', 'page_name' => 'Pages', 'page_path' => '/pages', 'page_group' => 'Access', 'default' => false],
            ['page_key' => 'users', 'page_name' => 'Users', 'page_path' => '/users', 'page_group' => 'Access', 'default' => false],
            ['page_key' => 'contacts', 'page_name' => 'Contacts', 'page_path' => '/contacts', 'page_group' => 'Contacts', 'default' => true],
            ['page_key' => 'groups', 'page_name' => 'Groups', 'page_path' => '/groups', 'page_group' => 'Groups', 'default' => true],
            ['page_key' => 'group-members', 'page_name' => 'Group members', 'page_path' => '/group-members', 'page_group' => 'Groups', 'default' => true],
            ['page_key' => 'group-expenses', 'page_name' => 'Group expenses', 'page_path' => '/group-expenses', 'page_group' => 'Groups', 'default' => true],
            ['page_key' => 'debts', 'page_name' => 'Debts', 'page_path' => '/debts', 'page_group' => 'Debts', 'default' => true],
            ['page_key' => 'bulk-debt-assign', 'page_name' => 'Bulk debt assign', 'page_path' => '/debts/bulk-assign', 'page_group' => 'Debts', 'default' => true],
            ['page_key' => 'payments', 'page_name' => 'Payments', 'page_path' => '/payments', 'page_group' => 'Debts', 'default' => true],
            ['page_key' => 'notifications', 'page_name' => 'Notifications', 'page_path' => '/notifications', 'page_group' => 'Activity', 'default' => true],
            ['page_key' => 'achievements', 'page_name' => 'Achievements', 'page_path' => '/achievements', 'page_group' => 'Activity', 'default' => true],
            ['page_key' => 'logs', 'page_name' => 'Logs', 'page_path' => '/logs', 'page_group' => 'Activity', 'default' => false],
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function defaultUserPageIds(): array
    {
        $keys = collect(self::catalogue())->where('default', true)->pluck('page_key');

        return Page::whereIn('page_key', $keys)->pluck('page_id')->all();
    }

    public function run()
    {
        foreach (self::catalogue() as $index => $page) {
            Page::updateOrCreate(
                ['page_key' => $page['page_key']],
                [
                    'page_name' => $page['page_name'],
                    'page_path' => $page['page_path'],
                    'page_group' => $page['page_group'],
                    'sort_order' => ($index + 1) * 10,
                ],
            );
        }

        $admin = Role::firstOrCreate(['role_name' => Role::ADMIN_NAME]);
        $admin->update(['is_admin' => true]);

        // Only grant the default set when the role is brand new, so re-seeding
        // never undoes access an admin has deliberately changed.
        $user = Role::firstOrCreate(['role_name' => Role::DEFAULT_USER_NAME]);
        if ($user->wasRecentlyCreated) {
            $user->pages()->sync(self::defaultUserPageIds());
        }
    }
}
