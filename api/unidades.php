<?php
// Configuración de CORS
// Permitir solicitudes desde cualquier origen
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db.php';

header('Content-Type: application/json');

// Endpoint GET: listar todas las unidades o una por ID
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $sql = "SELECT u.*, s.nombre AS sector, ur.nombre AS urbanizacion
                FROM unidades u
                LEFT JOIN sectores s ON u.id_sector = s.id
                LEFT JOIN urbanizaciones ur ON s.id_urbanizacion = ur.id
                WHERE u.id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $unidad = $result->fetch_assoc();
        if ($unidad) {
            echo json_encode($unidad);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'No encontrado']);
        }
    } else {
        $where = [];
        $params = [];
        $types = '';

        if (isset($_GET['id_urbanizacion']) && is_numeric($_GET['id_urbanizacion']) && intval($_GET['id_urbanizacion']) > 0) {
            $where[] = 's.id_urbanizacion = ?';
            $params[] = intval($_GET['id_urbanizacion']);
            $types .= 'i';
        }
        if (isset($_GET['id_sector']) && is_numeric($_GET['id_sector']) && intval($_GET['id_sector']) > 0) {
            $where[] = 'u.id_sector = ?';
            $params[] = intval($_GET['id_sector']);
            $types .= 'i';
        }
        // LEFT JOIN con unidad_persona y personas para traer el propietario (persona asociada más reciente)
        $sql = "SELECT u.*, s.nombre AS sector, ur.nombre AS urbanizacion, p.nombre AS persona
                FROM unidades u
                LEFT JOIN sectores s ON u.id_sector = s.id
                LEFT JOIN urbanizaciones ur ON s.id_urbanizacion = ur.id
                LEFT JOIN unidad_persona up ON up.id_unidad = u.id
                LEFT JOIN personas p ON up.id_persona = p.id
                ";
        if (isset($_GET['nombre_persona']) && $_GET['nombre_persona'] !== '') {
            $where[] = "p.nombre LIKE ?";
            $params[] = '%' . $_GET['nombre_persona'] . '%';
            $types .= 's';
        }
        if (count($where) > 0) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }
        $sql .= " GROUP BY u.id";

        if (count($params) > 0) {
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $result = $conn->query($sql);
        }
        $unidades = [];
        while ($row = $result->fetch_assoc()) {
            $unidades[] = $row;
        }
        echo json_encode($unidades);
    }
    exit;
}

// Endpoint POST: crear una nueva unidad
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $codigo = $conn->real_escape_string($data['codigo']);
    $tipo = $conn->real_escape_string($data['tipo']);
    $metros2 = isset($data['metros2']) ? floatval($data['metros2']) : null;
    $estado = isset($data['estado']) ? $conn->real_escape_string($data['estado']) : 'desocupado';
    $id_sector = isset($data['id_sector']) ? intval($data['id_sector']) : null;
    $id_urbanizacion = intval($data['id_urbanizacion']);

    $sql = "INSERT INTO unidades (codigo, tipo, metros2, estado, id_sector, id_urbanizacion)
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssdssi', $codigo, $tipo, $metros2, $estado, $id_sector, $id_urbanizacion);
    $ok = $stmt->execute();
    if ($ok) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
    exit;
}

// Endpoint PUT: actualizar una unidad existente
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id']);
    $codigo = $conn->real_escape_string($data['codigo']);
    $tipo = $conn->real_escape_string($data['tipo']);
    $metros2 = isset($data['metros2']) ? floatval($data['metros2']) : null;
    $estado = isset($data['estado']) ? $conn->real_escape_string($data['estado']) : 'desocupado';
    $id_sector = isset($data['id_sector']) ? intval($data['id_sector']) : null;
    $id_urbanizacion = intval($data['id_urbanizacion']);

    $sql = "UPDATE unidades SET codigo=?, tipo=?, metros2=?, estado=?, id_sector=?, id_urbanizacion=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssdssii', $codigo, $tipo, $metros2, $estado, $id_sector, $id_urbanizacion, $id);
    $ok = $stmt->execute();
    if ($ok) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
    exit;
}

// Endpoint DELETE: eliminar una unidad
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id']);
    $sql = "DELETE FROM unidades WHERE id=?";
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
