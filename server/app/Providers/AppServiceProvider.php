<?php

namespace App\Providers;

use App\Repositories\Contracts\ContactRepositoryInterface;
use App\Repositories\Contracts\DebtRepositoryInterface;
use App\Repositories\Contracts\GroupMemberRepositoryInterface;
use App\Repositories\Contracts\GroupRepositoryInterface;
use App\Repositories\Contracts\PaymentHistoryRepositoryInterface;
use App\Repositories\Contracts\PaymentRepositoryInterface;
use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\ContactRepository;
use App\Repositories\DebtRepository;
use App\Repositories\GroupMemberRepository;
use App\Repositories\GroupRepository;
use App\Repositories\PaymentHistoryRepository;
use App\Repositories\PaymentRepository;
use App\Repositories\RoleRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(RoleRepositoryInterface::class, RoleRepository::class);
        $this->app->bind(ContactRepositoryInterface::class, ContactRepository::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(GroupRepositoryInterface::class, GroupRepository::class);
        $this->app->bind(GroupMemberRepositoryInterface::class, GroupMemberRepository::class);
        $this->app->bind(DebtRepositoryInterface::class, DebtRepository::class);
        $this->app->bind(PaymentRepositoryInterface::class, PaymentRepository::class);
        $this->app->bind(PaymentHistoryRepositoryInterface::class, PaymentHistoryRepository::class);
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
