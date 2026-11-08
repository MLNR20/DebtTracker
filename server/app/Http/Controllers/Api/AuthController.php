<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Log;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email_address' => ['required', 'email', 'max:255', 'unique:users,email_address'],
            'user_name' => ['required', 'string', 'max:255', 'unique:users,user_name'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email_address' => $validated['email_address'],
            'user_name' => $validated['user_name'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(array_merge(['user' => $user], $this->issueTokens($user)), 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email_address', $validated['login'])
            ->orWhere('user_name', $validated['login'])
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['The provided credentials are incorrect.'],
            ]);
        }

        $tokens = $this->issueTokens($user);

        Log::create([
            'user_id' => $user->user_id,
            'logs_type' => 'login',
            'logs_details' => "{$user->user_name} logged in",
        ]);

        return response()->json(array_merge(['user' => $user], $tokens));
    }

    public function refresh(Request $request)
    {
        $validated = $request->validate([
            'refresh_token' => ['required', 'string'],
        ]);

        $refreshToken = PersonalAccessToken::findToken($validated['refresh_token']);

        if (
            ! $refreshToken
            || ! in_array('issue-access-token', $refreshToken->abilities ?? [], true)
            || ($refreshToken->expires_at && $refreshToken->expires_at->isPast())
        ) {
            return response()->json(['message' => 'Invalid or expired refresh token.'], 401);
        }

        $user = $refreshToken->tokenable;

        // Rotate: a refresh token can only be used once.
        $refreshToken->delete();

        if (! $user) {
            return response()->json(['message' => 'Invalid or expired refresh token.'], 401);
        }

        return response()->json($this->issueTokens($user));
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email_address' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::where('email_address', $validated['email_address'])->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email_address' => ['We could not find a user with that email address.'],
            ]);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json(['message' => 'Password updated successfully.']);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        if ($refresh = $request->input('refresh_token')) {
            $refreshToken = PersonalAccessToken::findToken($refresh);
            if ($refreshToken
                && (string) $refreshToken->tokenable_id === (string) $user->getKey()
                && in_array('issue-access-token', $refreshToken->abilities ?? [], true)) {
                $refreshToken->delete();
            }
        }

        Log::create([
            'user_id' => $user->user_id,
            'logs_type' => 'logout',
            'logs_details' => "{$user->user_name} logged out",
        ]);

        return response()->json(['message' => 'Logged out']);
    }

    /**
     * Issue a short-lived access token and a long-lived refresh token.
     */
    private function issueTokens(User $user): array
    {
        $accessMinutes = (int) config('sanctum.access_token_expiration', 60);
        $refreshMinutes = (int) config('sanctum.refresh_token_expiration', 60 * 24 * 30);

        $access = $user->createToken('access_token', ['access-api'], now()->addMinutes($accessMinutes));
        $refresh = $user->createToken('refresh_token', ['issue-access-token'], now()->addMinutes($refreshMinutes));

        return [
            'token' => $access->plainTextToken,
            'refresh_token' => $refresh->plainTextToken,
            'token_type' => 'Bearer',
            'expires_in' => $accessMinutes * 60,
        ];
    }
}
