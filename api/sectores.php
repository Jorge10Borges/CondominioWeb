<?php
// Permitir solicitudes desde cualquier origen
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

header('Content-Type: application/json');

// Endpoint GET: listar todos los sectores o uno por ID
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $sql = "SELECT * FROM sectores WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $sector = $result->fetch_assoc();
        if ($sector) {
            echo json_encode($sector);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'No encontrado']);
        }
    } else {
        if (isset($_GET['id_urbanizacion']) && is_numeric($_GET['id_urbanizacion']) && intval($_GET['id_urbanizacion']) > 0) {
            $id_urbanizacion = intval($_GET['id_urbanizacion']);
            $sql = "SELECT s.*, u.nombre AS urbanizacion FROM sectores s LEFT JOIN urbanizaciones u ON s.id_urbanizacion = u.id WHERE s.id_urbanizacion = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $id_urbanizacion);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $sql = "SELECT s.*, u.nombre AS urbanizacion FROM sectores s LEFT JOIN urbanizaciones u ON s.id_urbanizacion = u.id";
            $result = $conn->query($sql);
        }
        $sectores = [];
        while ($row = $result->fetch_assoc()) {
            $sectores[] = $row;
        }
        echo json_encode($sectores);
    }
    exit;
}

// Endpoint POST: crear un nuevo sector
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $nombre = $conn->real_escape_string($data['nombre']);
    $id_urbanizacion = intval($data['id_urbanizacion']);

    $sql = "INSERT INTO sectores (nombre, id_urbanizacion) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('si', $nombre, $id_urbanizacion);
    $ok = $stmt->execute();
    if ($ok) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
    exit;
}

// Endpoint PUT: actualizar un sector existente
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id']);
    $nombre = $conn->real_escape_string($data['nombre']);
    $id_urbanizacion = intval($data['id_urbanizacion']);

    $sql = "UPDATE sectores SET nombre=?, id_urbanizacion=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sii', $nombre, $id_urbanizacion, $id);
    $ok = $stmt->execute();
    if ($ok) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
    exit;
}

// Endpoint DELETE: eliminar un sector
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id']);
    $sql = "DELETE FROM sectores WHERE id=?";
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
