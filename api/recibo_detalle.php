
<?php
// api/recibo_detalle.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, DELETE, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
require_once 'db.php';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    // Obtener detalles de un recibo
    $reciboId = $_GET['reciboId'] ?? null;
    if (!$reciboId) {
        http_response_code(400);
        echo json_encode(["error" => "Falta el reciboId"]);
        exit;
    }
    $stmt = $conn->prepare("SELECT id, concepto, descripcion, monto FROM recibo_detalles WHERE id_recibo = ?");
    $stmt->bind_param('i', $reciboId);
    $stmt->execute();
    $result = $stmt->get_result();
    $detalles = [];
    while ($row = $result->fetch_assoc()) {
        $detalles[] = $row;
    }
    $stmt->close();
    echo json_encode(["success" => true, "detalles" => $detalles]);
    $conn->close();
    exit;
}
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $reciboId = $input['reciboId'] ?? null;
    $concepto = $input['concepto'] ?? null;
    $descripcion = $input['descripcion'] ?? null;
    $monto = $input['monto'] ?? null;
    if (!$reciboId || !$concepto || !$descripcion || $monto === null) {
        http_response_code(400);
        echo json_encode(["error" => "Faltan datos requeridos"]);
        exit;
    }
    $stmt = $conn->prepare("INSERT INTO recibo_detalles (id_recibo, concepto, descripcion, monto) VALUES (?, ?, ?, ?)");
    $stmt->bind_param('isss', $reciboId, $concepto, $descripcion, $monto);

    if ($stmt->execute()) {
        $id = $stmt->insert_id;
        $stmt->close();
        // Devolver el detalle insertado
        $detalle = [
            "id" => $id,
            "concepto" => $concepto,
            "descripcion" => $descripcion,
            "monto" => $monto
        ];
        echo json_encode(["success" => true, "id" => $id, "detalle" => $detalle]);
    } else {
        $error = $stmt->error;
        $stmt->close();
        http_response_code(500);
        echo json_encode(["error" => "Error al guardar detalle: $error"]);
    }
    $conn->close();
    exit;
}

if ($method === 'DELETE') {
    // Eliminar detalle por id
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Falta el id del detalle"]);
        exit;
    }
    require_once 'db.php';
    $stmt = $conn->prepare("DELETE FROM recibo_detalles WHERE id = ?");
    $stmt->bind_param('i', $id);
    if ($stmt->execute()) {
        $stmt->close();
        echo json_encode(["success" => true]);
    } else {
        $error = $stmt->error;
        $stmt->close();
        http_response_code(500);
        echo json_encode(["error" => "Error al eliminar detalle: $error"]);
    }
    $conn->close();
    exit;
}

if ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    $concepto = $input['concepto'] ?? null;
    $descripcion = $input['descripcion'] ?? null;
    $monto = $input['monto'] ?? null;
    if (!$id || !$concepto || !$descripcion || $monto === null) {
        http_response_code(400);
        echo json_encode(["error" => "Faltan datos requeridos"]);
        exit;
    }
    $stmt = $conn->prepare("UPDATE recibo_detalles SET concepto=?, descripcion=?, monto=? WHERE id=?");
    $stmt->bind_param('sssi', $concepto, $descripcion, $monto, $id);
    if ($stmt->execute()) {
        $stmt->close();
        echo json_encode(["success" => true]);
    } else {
        $error = $stmt->error;
        $stmt->close();
        http_response_code(500);
        echo json_encode(["error" => "Error al actualizar detalle: $error"]);
    }
    $conn->close();
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
