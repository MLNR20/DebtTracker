<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('group_members', function (Blueprint $table) {
            $table->uuid('group_member_id')->primary();
            $table->foreignUuid('group_id')->constrained('groups', 'group_id');
            $table->foreignUuid('user_id')->constrained('users', 'user_id');
            $table->timestamp('date_joined')->useCurrent();
        });
    }

    public function down()
    {
        Schema::dropIfExists('group_members');
    }
};
