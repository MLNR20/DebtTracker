<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(): User
    {
        static $n = 0;
        $n++;

        return User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email_address' => "user{$n}@example.com",
            'user_name' => "user{$n}",
            'password' => Hash::make('old-password'),
        ]);
    }

    public function test_reset_link_is_sent_to_a_registered_email(): void
    {
        Notification::fake();
        $user = $this->makeUser();

        $this->postJson('/api/forgot-password', ['email_address' => $user->email_address])
            ->assertOk();

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_unknown_email_gets_same_response_and_no_notification(): void
    {
        Notification::fake();

        $known = $this->postJson('/api/forgot-password', ['email_address' => $this->makeUser()->email_address]);
        $unknown = $this->postJson('/api/forgot-password', ['email_address' => 'nobody@example.com']);

        $unknown->assertOk();
        $this->assertSame($known->json(), $unknown->json());
        Notification::assertSentTimes(ResetPassword::class, 1);
    }

    public function test_password_can_be_reset_with_the_emailed_token_and_sessions_are_revoked(): void
    {
        Notification::fake();
        $user = $this->makeUser();
        $user->createToken('access_token', ['access-api']);

        $this->postJson('/api/forgot-password', ['email_address' => $user->email_address]);

        $url = null;
        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $n) use ($user, &$url) {
            $url = $n->toMail($user)->actionUrl;

            return true;
        });

        parse_str(parse_url($url, PHP_URL_QUERY), $query);
        $this->assertStringContainsString('/reset-password?', $url);
        $this->assertSame($user->email_address, $query['email']);

        $this->postJson('/api/reset-password', [
            'token' => $query['token'],
            'email_address' => $user->email_address,
            'password' => 'new-password-1',
            'password_confirmation' => 'new-password-1',
        ])->assertOk();

        $this->assertTrue(Hash::check('new-password-1', $user->fresh()->password));
        $this->assertSame(0, $user->tokens()->count());

        // The token is single-use.
        $this->postJson('/api/reset-password', [
            'token' => $query['token'],
            'email_address' => $user->email_address,
            'password' => 'another-password-2',
            'password_confirmation' => 'another-password-2',
        ])->assertStatus(422);
    }

    public function test_reset_fails_with_an_invalid_token(): void
    {
        $user = $this->makeUser();

        $this->postJson('/api/reset-password', [
            'token' => 'not-a-real-token',
            'email_address' => $user->email_address,
            'password' => 'new-password-1',
            'password_confirmation' => 'new-password-1',
        ])->assertStatus(422)->assertJsonValidationErrors('email_address');

        $this->assertFalse(Hash::check('new-password-1', $user->fresh()->password));
    }
}
