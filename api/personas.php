<?php
// Configuración de CORS
// Permitir solicitudes desde cualquier origen
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

header('Content-Type: application/json');

// Endpoint GET: listar todas las personas o una por ID
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $sql = "SELECT * FROM personas WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $persona = $result->fetch_assoc();
        if ($persona) {
            echo json_encode($persona);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'No encontrado']);
        }
    } else {
        $sql = "SELECT * FROM personas";
        $result = $conn->query($sql);
        $personas = [];
        while ($row = $result->fetch_assoc()) {
            $personas[] = $row;
        }
        echo json_encode($personas);
    }
    exit;
}

// Endpoint POST: crear una nueva persona
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $nombre = $conn->real_escape_string($data['nombre']);
    $cedula = $conn->real_escape_string($data['cedula']);
    $telefono = isset($data['telefono']) ? $conn->real_escape_string($data['telefono']) : null;
    $email = isset($data['email']) ? $conn->real_escape_string($data['email']) : null;
    $direccion = isset($data['direccion']) ? $conn->real_escape_string($data['direccion']) : null;

    $sql = "INSERT INTO personas (nombre, cedula, telefono, email, direccion) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sssss', $nombre, $cedula, $telefono, $email, $direccion);
    $ok = $stmt->execute();
    if ($ok) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
    exit;
}

// Endpoint PUT: actualizar una persona existente
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id']);
    $nombre = $conn->real_escape_string($data['nombre']);
    $cedula = $conn->real_escape_string($data['cedula']);
    $telefono = isset($data['telefono']) ? $conn->real_escape_string($data['telefono']) : null;
    $email = isset($data['email']) ? $conn->real_escape_string($data['email']) : null;
    $direccion = isset($data['direccion']) ? $conn->real_escape_string($data['direccion']) : null;

    $sql = "UPDATE personas SET nombre=?, cedula=?, telefono=?, email=?, direccion=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sssssi', $nombre, $cedula, $telefono, $email, $direccion, $id);
    $ok = $stmt->execute();
    if ($ok) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
    exit;
}

// Endpoint DELETE: eliminar una persona
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id']);
    $sql = "DELETE FROM personas WHERE id=?";
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
