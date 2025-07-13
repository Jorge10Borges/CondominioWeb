<?php
// Configuración de CORS
// Permitir solicitudes desde cualquier origen
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');


// api/tipos_recibo_especial.php
header('Content-Type: application/json');
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
  case 'GET':
    $sql = "SELECT id, nombre, descripcion FROM tipos_recibo_especial WHERE activo = 1 ORDER BY nombre";
    $result = $conn->query($sql);
    $tipos = [];
    while ($row = $result->fetch_assoc()) {
      $tipos[] = $row;
    }
    echo json_encode($tipos);
    break;
  // Aquí puedes agregar POST/PUT/DELETE para gestión futura
  default:
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
}
$conn->close();
