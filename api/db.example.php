<?php
// Ejemplo de configuración, copia este archivo como db.php y coloca tus credenciales locales

define('DB_HOST_DEV', 'localhost');
define('DB_USER_DEV', 'usuario_local');
define('DB_PASS_DEV', 'password_local');
define('DB_NAME_DEV', 'condominioweb');

define('DB_HOST_PROD', 'localhost');
define('DB_USER_PROD', 'usuario_prod');
define('DB_PASS_PROD', 'password_prod');
define('DB_NAME_PROD', 'condominioweb_prod');

$env = 'dev';

if ($env === 'prod') {
    define('DB_HOST', DB_HOST_PROD);
    define('DB_USER', DB_USER_PROD);
    define('DB_PASS', DB_PASS_PROD);
    define('DB_NAME', DB_NAME_PROD);
} else {
    define('DB_HOST', DB_HOST_DEV);
    define('DB_USER', DB_USER_DEV);
    define('DB_PASS', DB_PASS_DEV);
    define('DB_NAME', DB_NAME_DEV);
}

// ...conexión igual que en db.php
