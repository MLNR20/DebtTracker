<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('notifications_id')->primary();
            $table->foreignUuid('user_id')->constrained('users', 'user_id');
            $table->string('notification_header');
            $table->string('notification_body');
            $table->boolean('is_read')->default(false);
            $table->timestamp('date_created')->useCurrent();
            $table->timestamp('date_updated')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down()
    {
        Schema::dropIfExists('notifications');
    }
};
