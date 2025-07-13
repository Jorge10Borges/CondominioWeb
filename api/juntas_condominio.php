<?php
// juntas_condominio.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Obtener todas las juntas o una específica
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $conn->prepare('SELECT * FROM juntas_condominio WHERE id = ?');
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $junta = $result->fetch_assoc();
            echo json_encode($junta);
        } else {
            $result = $conn->query('SELECT * FROM juntas_condominio ORDER BY fecha_inicio DESC');
            $juntas = [];
            while ($row = $result->fetch_assoc()) {
                $juntas[] = $row;
            }
            echo json_encode($juntas);
        }
        break;
    case 'POST':
        // Crear nueva junta
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['nombre']) || !isset($data['fecha_inicio'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan campos obligatorios']);
            exit;
        }
        $nombre = $data['nombre'];
        $fecha_inicio = $data['fecha_inicio'];
        $fecha_fin = isset($data['fecha_fin']) ? $data['fecha_fin'] : null;
        $stmt = $conn->prepare('INSERT INTO juntas_condominio (nombre, fecha_inicio, fecha_fin) VALUES (?, ?, ?)');
        $stmt->bind_param('sss', $nombre, $fecha_inicio, $fecha_fin);
        $stmt->execute();
        echo json_encode(['id' => $conn->insert_id]);
        break;
    case 'PUT':
        // Actualizar junta existente
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'ID requerido']);
            exit;
        }
        $id = intval($_GET['id']);
        $data = json_decode(file_get_contents('php://input'), true);
        $campos = [];
        $tipos = '';
        $valores = [];
        if (isset($data['nombre'])) {
            $campos[] = 'nombre = ?';
            $tipos .= 's';
            $valores[] = $data['nombre'];
        }
        if (isset($data['fecha_inicio'])) {
            $campos[] = 'fecha_inicio = ?';
            $tipos .= 's';
            $valores[] = $data['fecha_inicio'];
        }
        if (array_key_exists('fecha_fin', $data)) {
            $campos[] = 'fecha_fin = ?';
            $tipos .= 's';
            $valores[] = $data['fecha_fin'];
        }
        if (empty($campos)) {
            http_response_code(400);
            echo json_encode(['error' => 'Nada para actualizar']);
            exit;
        }
        $sql = 'UPDATE juntas_condominio SET ' . implode(', ', $campos) . ' WHERE id = ?';
        $tipos .= 'i';
        $valores[] = $id;
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($tipos, ...$valores);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;
    case 'DELETE':
        // Eliminar junta
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'ID requerido']);
            exit;
        }
        $id = intval($_GET['id']);
        $stmt = $conn->prepare('DELETE FROM juntas_condominio WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}
