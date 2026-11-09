<?php

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('roles', function (Blueprint $table) {
            // Admin roles bypass page checks and can never be locked out.
            $table->boolean('is_admin')->default(false)->after('role_name');
        });

        Schema::create('pages', function (Blueprint $table) {
            $table->uuid('page_id')->primary();
            $table->string('page_key')->unique();
            $table->string('page_name');
            $table->string('page_path');
            $table->string('page_group')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('date_created')->useCurrent();
            $table->timestamp('date_updated')->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('role_pages', function (Blueprint $table) {
            $table->foreignUuid('role_id')->constrained('roles', 'role_id')->cascadeOnDelete();
            $table->foreignUuid('page_id')->constrained('pages', 'page_id')->cascadeOnDelete();
            $table->timestamp('date_created')->useCurrent();
            $table->primary(['role_id', 'page_id']);
        });

        // Make sure existing installs are not locked out once enforcement is on.
        (new RbacSeeder())->run();
        $this->backfillExistingData();
    }

    public function down()
    {
        Schema::dropIfExists('role_pages');
        Schema::dropIfExists('pages');

        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('is_admin');
        });
    }

    private function backfillExistingData(): void
    {
        $defaultPageIds = RbacSeeder::defaultUserPageIds();

        // Existing non-admin roles with no pages get the standard user set.
        Role::where('is_admin', false)
            ->whereDoesntHave('pages')
            ->get()
            ->each(fn (Role $role) => $role->pages()->sync($defaultPageIds));

        // Users registered without a role fall back to the default "User" role.
        $userRoleId = Role::where('role_name', Role::DEFAULT_USER_NAME)->value('role_id');
        if ($userRoleId) {
            User::whereNull('role_id')->update(['role_id' => $userRoleId]);
        }
    }
};
