
<?php
// Configuración de conexión para desarrollo
define('DB_HOST_DEV', '192.168.0.200');
define('DB_USER_DEV', 'jorge10borges');
define('DB_PASS_DEV', 'Ve*11818946');
define('DB_NAME_DEV', 'condominioweb');

// Configuración de conexión para producción (ajusta estos valores cuando subas a tu servidor)
define('DB_HOST_PROD', 'localhost'); // Cambia por el host de tu servidor
define('DB_USER_PROD', 'usuario_prod');
define('DB_PASS_PROD', 'password_prod');
define('DB_NAME_PROD', 'condominioweb_prod');

// Selecciona el entorno: 'dev' o 'prod'
$env = 'dev'; // Cambia a 'prod' en producción

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

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die('Error de conexión: ' . $conn->connect_error);
}
$conn->set_charset('utf8');
