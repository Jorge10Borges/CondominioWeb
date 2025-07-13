<?php
// api/recibos.php

// Configuración de CORS para todas las respuestas
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
  case 'POST':
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
      http_response_code(400);
      echo json_encode(["error" => "Datos JSON inválidos"]);
      exit;
    }
    // Validar campos requeridos
    $juntaId = $input['juntaId'] ?? null;
    $tipo = $input['tipo'] ?? null; // 'mensual' o 'especial'
    $mes = $input['mes'] ?? null;
    $anio = $input['anio'] ?? null;
    $sectorId = $input['sectorId'] ?? null;
    $tipoReciboEspecial = $input['tipoReciboEspecial'] ?? null;
    if (!$juntaId || !$tipo || ($tipo === 'mensual' && (!$mes || !$anio))) {
      http_response_code(400);
      echo json_encode(["error" => "Faltan datos requeridos"]);
      exit;
    }
    // Aquí iría la lógica para crear los recibos (simplificado)
    // Por ahora solo simula éxito
    echo json_encode([
      "success" => true,
      "message" => "Recibos creados correctamente",
      "data" => [
        "juntaId" => $juntaId,
        "tipo" => $tipo,
        "mes" => $mes,
        "anio" => $anio,
        "sectorId" => $sectorId,
        "tipoReciboEspecial" => $tipoReciboEspecial
      ]
    ]);
    break;
  case 'PUT':
    // Endpoint para mandar recibos
    // Espera: { reciboId: int, unidades: [id_unidad, ...], usuarioId: int (opcional) }
    $input = json_decode(file_get_contents('php://input'), true);
    $reciboId = $input['reciboId'] ?? null;
    $unidades = $input['unidades'] ?? [];
    $usuarioId = $input['usuarioId'] ?? null;
    if (!$reciboId || !is_array($unidades) || count($unidades) === 0) {
      http_response_code(400);
      echo json_encode(["error" => "Faltan datos para mandar recibos"]);
      exit;
    }
    // 1. Marcar el recibo como no editable
    $stmt = $conn->prepare("UPDATE recibos SET editable = 0 WHERE id = ?");
    $stmt->bind_param('i', $reciboId);
    $stmt->execute();
    $stmt->close();
    // 2. Insertar en recibos_unidad
    $stmt2 = $conn->prepare("INSERT INTO recibos_unidad (id_recibo, id_unidad, fecha_envio, enviado_por) VALUES (?, ?, NOW(), ?)");
    foreach ($unidades as $idUnidad) {
      $uid = $usuarioId ? $usuarioId : null;
      $stmt2->bind_param('iii', $reciboId, $idUnidad, $uid);
      $stmt2->execute();
    }
    $stmt2->close();
    echo json_encode(["success" => true, "message" => "Recibo enviado a las unidades seleccionadas."]);
    break;
  default:
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
}
$conn->close();
