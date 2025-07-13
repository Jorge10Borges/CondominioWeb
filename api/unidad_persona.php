<?php
// Configuración de CORS
// Permitir solicitudes desde cualquier origen
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

header('Content-Type: application/json');

// Endpoint GET: listar todas las relaciones unidad-persona o una por ID
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $sql = "SELECT up.*, p.nombre AS persona, u.codigo AS unidad, u.tipo, up.rol, up.fecha_inicio, up.fecha_fin
                FROM unidad_persona up
                LEFT JOIN personas p ON up.id_persona = p.id
                LEFT JOIN unidades u ON up.id_unidad = u.id
                WHERE up.id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $relacion = $result->fetch_assoc();
        if ($relacion) {
            echo json_encode($relacion);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'No encontrado']);
        }
    } else {
        $sql = "SELECT up.*, p.nombre AS persona, u.codigo AS unidad, u.tipo, up.rol, up.fecha_inicio, up.fecha_fin
                FROM unidad_persona up
                LEFT JOIN personas p ON up.id_persona = p.id
                LEFT JOIN unidades u ON up.id_unidad = u.id";
        $result = $conn->query($sql);
        $relaciones = [];
        while ($row = $result->fetch_assoc()) {
            $relaciones[] = $row;
        }
        echo json_encode($relaciones);
    }
    exit;
}

// Endpoint POST: crear una nueva relación unidad-persona
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id_unidad = intval($data['id_unidad']);
    $id_persona = intval($data['id_persona']);
    $rol = $conn->real_escape_string($data['rol']);
    $fecha_inicio = $conn->real_escape_string($data['fecha_inicio']);
    $fecha_fin = isset($data['fecha_fin']) ? $conn->real_escape_string($data['fecha_fin']) : null;

    $sql = "INSERT INTO unidad_persona (id_unidad, id_persona, rol, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iisss', $id_unidad, $id_persona, $rol, $fecha_inicio, $fecha_fin);
    $ok = $stmt->execute();
    if ($ok) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
    exit;
}

// Endpoint PUT: actualizar una relación unidad-persona existente
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id']);
    $id_unidad = intval($data['id_unidad']);
    $id_persona = intval($data['id_persona']);
    $rol = $conn->real_escape_string($data['rol']);
    $fecha_inicio = $conn->real_escape_string($data['fecha_inicio']);
    $fecha_fin = isset($data['fecha_fin']) ? $conn->real_escape_string($data['fecha_fin']) : null;

    $sql = "UPDATE unidad_persona SET id_unidad=?, id_persona=?, rol=?, fecha_inicio=?, fecha_fin=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iisssi', $id_unidad, $id_persona, $rol, $fecha_inicio, $fecha_fin, $id);
    $ok = $stmt->execute();
    if ($ok) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
    exit;
}

// Endpoint DELETE: eliminar una relación unidad-persona
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id']);
    $sql = "DELETE FROM unidad_persona WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);
    $ok = $stmt->execute();
    if ($ok) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
    exit;
}
