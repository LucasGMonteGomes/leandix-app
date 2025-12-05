<?php
/**
 * Gerenciamento de Sessão
 */

class Session
{

    public static function start()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function set($key, $value)
    {
        self::start();
        $_SESSION[$key] = $value;
    }

    public static function get($key, $default = null)
    {
        self::start();
        return $_SESSION[$key] ?? $default;
    }

    public static function has($key)
    {
        self::start();
        return isset($_SESSION[$key]);
    }

    public static function remove($key)
    {
        self::start();
        if (isset($_SESSION[$key])) {
            unset($_SESSION[$key]);
        }
    }

    public static function destroy()
    {
        self::start();
        session_unset();
        session_destroy();
    }

    public static function isLoggedIn()
    {
        return self::has('user_id');
    }

    public static function getUserId()
    {
        return self::get('user_id');
    }

    public static function getUser()
    {
        return self::get('user');
    }

    public static function setUser($user)
    {
        self::set('user_id', $user['id']);
        self::set('user', $user);
    }

    public static function requireAuth()
    {
        if (!self::isLoggedIn()) {
            Response::error('Não autenticado', 401);
        }
    }

    public static function requireAdmin()
    {
        self::requireAuth();
        $user = self::getUser();
        if ($user['tipo'] !== 'administrador') {
            Response::error('Acesso negado. Apenas administradores.', 403);
        }
    }
}
