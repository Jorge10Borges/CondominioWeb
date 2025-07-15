<?php
file_put_contents('debug_recibos.log', date('c') . " INICIO RECIBOS.PHP " . json_encode($_SERVER) . "\n", FILE_APPEND);
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
  case 'GET':
    // DEBUG: Mostrar los filtros recibidos
    file_put_contents('debug_recibos.log', date('c') . ' ' . json_encode($_GET) . "\n", FILE_APPEND);
    // Obtener recibos filtrados por editable, juntaIds, tipo, mes, anio, tipoReciboEspecial
    $editable = isset($_GET['editable']) ? intval($_GET['editable']) : null;
    // Aceptar tanto juntaIds (array/cadena) como juntaId (simple)
    $juntaIds = $_GET['juntaIds'] ?? $_GET['juntaId'] ?? null;
    $tipo = isset($_GET['tipoRecibo']) ? $_GET['tipoRecibo'] : null;
    $mes = isset($_GET['mes']) ? intval($_GET['mes']) : null;
    $anio = isset($_GET['anio']) ? intval($_GET['anio']) : null;
    $tipoReciboEspecial = isset($_GET['tipoReciboEspecial']) ? intval($_GET['tipoReciboEspecial']) : null;
    $where = [];
    $params = [];
    $types = '';
    if ($editable !== null) {
      $where[] = 'editable = ?';
      $params[] = $editable;
      $types .= 'i';
    }
    if ($juntaIds) {
      $ids = array_filter(array_map('intval', explode(',', $juntaIds)));
      if (count($ids) > 0) {
        $where[] = 'id_junta IN (' . implode(',', array_fill(0, count($ids), '?')) . ')';
        $params = array_merge($params, $ids);
        $types .= str_repeat('i', count($ids));
      }
    }
    if ($tipo === 'mensual') {
      $where[] = 'id_tipo_recibo = 0';
      if ($mes) {
        $where[] = 'mes = ?';
        $params[] = $mes;
        $types .= 'i';
      }
      if ($anio) {
        $where[] = 'anio = ?';
        $params[] = $anio;
        $types .= 'i';
      }
    } else if ($tipo === 'especial') {
      $where[] = 'id_tipo_recibo > 0';
      if ($tipoReciboEspecial) {
        $where[] = 'id_tipo_recibo = ?';
        $params[] = $tipoReciboEspecial;
        $types .= 'i';
      }
    }
    $sql = 'SELECT recibos.*, 
      CASE 
        WHEN recibos.id_tipo_recibo = 0 THEN "mensual" 
        ELSE tre.nombre 
      END AS tipo,
      (
        SELECT IFNULL(SUM(monto),0) FROM recibo_detalles d WHERE d.id_recibo = recibos.id
      ) AS total_recibo
      FROM recibos
      LEFT JOIN tipos_recibo_especial tre ON recibos.id_tipo_recibo = tre.id';
    if (count($where) > 0) {
      $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $stmt = $conn->prepare($sql);
    if ($params) {
      $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $recibos = [];
    while ($row = $result->fetch_assoc()) {
      $recibos[] = $row;
    }
    $stmt->close();
    echo json_encode($recibos);
    break;
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
    $idTipoRecibo = 0;
    if ($tipo === 'especial') {
      // El frontend debe enviar el id del tipo especial en tipoReciboEspecial
      $idTipoRecibo = isset($input['tipoReciboEspecial']) ? intval($input['tipoReciboEspecial']) : 0;
      if ($idTipoRecibo <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Falta el tipo de recibo especial"]);
        exit;
      }
    }
    if (!$juntaId || !$tipo || ($tipo === 'mensual' && (!$mes || !$anio))) {
      http_response_code(400);
      echo json_encode(["error" => "Faltan datos requeridos"]);
      exit;
    }
    // Insertar recibo en la base de datos
    $stmt = $conn->prepare("INSERT INTO recibos (id_junta, tipo, mes, anio, id_sector, id_tipo_recibo, editable, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())");
    $mesVal = $tipo === 'mensual' ? $mes : null;
    $anioVal = $tipo === 'mensual' ? $anio : null;
    $stmt->bind_param(
      'isiiii',
      $juntaId,
      $tipo,
      $mesVal,
      $anioVal,
      $sectorId,
      $idTipoRecibo
    );
    if ($stmt->execute()) {
      $id = $stmt->insert_id;
      $stmt->close();
      echo json_encode([
        "success" => true,
        "id" => $id,
        "message" => "Recibo creado correctamente"
      ]);
    } else {
      $error = $stmt->error;
      $stmt->close();
      http_response_code(500);
      echo json_encode(["error" => "Error al crear recibo: $error"]);
    }
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
  case 'DELETE':
    // Eliminar recibo y sus detalles
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if (!$id) {
      http_response_code(400);
      echo json_encode(["error" => "Falta el id del recibo"]);
      break;
    }
    // 1. Eliminar detalles del recibo
    $stmt1 = $conn->prepare("DELETE FROM recibo_detalles WHERE id_recibo = ?");
    $stmt1->bind_param('i', $id);
    $ok1 = $stmt1->execute();
    $stmt1->close();
    // 2. Eliminar el recibo principal
    $stmt2 = $conn->prepare("DELETE FROM recibos WHERE id = ?");
    $stmt2->bind_param('i', $id);
    $ok2 = $stmt2->execute();
    $stmt2->close();
    if ($ok2) {
      echo json_encode(["success" => true]);
    } else {
      http_response_code(500);
      echo json_encode(["error" => "No se pudo eliminar el recibo"]);
    }
    break;
  default:
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
}
$conn->close();
