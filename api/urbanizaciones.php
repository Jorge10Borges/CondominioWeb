<?php
// Configuración de CORS
// Permitir solicitudes desde cualquier origen
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

header('Content-Type: application/json');

// Endpoint GET: listar todas las urbanizaciones o una por ID
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $sql = "SELECT * FROM urbanizaciones WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $urbanizacion = $result->fetch_assoc();
        if ($urbanizacion) {
            echo json_encode($urbanizacion);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'No encontrado']);
        }
    } else {
        $sql = "SELECT * FROM urbanizaciones";
        $result = $conn->query($sql);
        $urbanizaciones = [];
        while ($row = $result->fetch_assoc()) {
            $urbanizaciones[] = $row;
        }
        echo json_encode($urbanizaciones);
    }
    exit;
}

// Endpoint POST: crear una nueva urbanización
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $nombre = $conn->real_escape_string($data['nombre']);
    $descripcion = isset($data['descripcion']) ? $conn->real_escape_string($data['descripcion']) : null;

    $sql = "INSERT INTO urbanizaciones (nombre, descripcion) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ss', $nombre, $descripcion);
    $ok = $stmt->execute();
    if ($ok) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
    exit;
}

// Endpoint PUT: actualizar una urbanización existente
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id']);
    $nombre = $conn->real_escape_string($data['nombre']);
    $descripcion = isset($data['descripcion']) ? $conn->real_escape_string($data['descripcion']) : null;

    $sql = "UPDATE urbanizaciones SET nombre=?, descripcion=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssi', $nombre, $descripcion, $id);
    $ok = $stmt->execute();
    if ($ok) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
    exit;
}

// Endpoint DELETE: eliminar una urbanización
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id']);
    $sql = "DELETE FROM urbanizaciones WHERE id=?";
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
