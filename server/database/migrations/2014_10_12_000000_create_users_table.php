<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('user_id')->primary();
            $table->foreignUuid('role_id')->nullable()->constrained('roles', 'role_id');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email_address')->unique();
            $table->string('contact_no')->nullable();
            $table->string('user_name')->unique();
            $table->string('password');
            $table->boolean('is_active')->default(true);
            $table->timestamp('date_created')->useCurrent();
            $table->timestamp('date_updated')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
};
