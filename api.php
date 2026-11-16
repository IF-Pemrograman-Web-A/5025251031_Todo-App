<?php
require_once 'config.php';
header('Content-Type: application/json');

function res($code, $data) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

if (($_SERVER['HTTP_X_API_KEY'] ?? '') !== 'todo-key-2026') {
    res(401, ['error' => 'Unauthorized: API Key salah atau kosong']);
}

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
if ($id !== null && !ctype_digit($id)) {
    res(400, ['error' => 'Bad Request: ID harus berupa angka']);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM todos WHERE id = ?");
            $stmt->execute([$id]);
            $todo = $stmt->fetch();
            $todo ? res(200, $todo) : res(404, ['error' => 'Todo tidak ditemukan']);
        }
        $type = $_GET['type'] ?? 'personal';
        $stmt = $pdo->prepare("SELECT * FROM todos WHERE type = ? ORDER BY created_at DESC");
        $stmt->execute([$type]);
        res(200, $stmt->fetchAll());

    case 'POST':
        $title = trim($input['title'] ?? '');
        if (!$title) res(400, ['error' => 'Bad Request: Title wajib diisi']);

        $image_path = null;
        if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
            $fileName = time() . '_' . basename($_FILES['image_file']['name']);
            if (move_uploaded_file($_FILES['image_file']['tmp_name'], $upload_dir . $fileName)) {
                $image_path = 'uploads/' . $fileName;
            }
        } elseif (!empty($input['camera_image_data'])) {
            $raw = explode(',', $input['camera_image_data'])[1] ?? '';
            $fileName = time() . '_camera.png';
            file_put_contents($upload_dir . $fileName, base64_decode($raw));
            $image_path = 'uploads/' . $fileName;
        }

        $stmt = $pdo->prepare("INSERT INTO todos (title, description, deadline, notif_time, image, status, type) VALUES (?, ?, ?, ?, ?, 'not-started', ?)");
        $stmt->execute([
            $title,
            trim($input['description'] ?? ''),
            ($input['deadline'] ?? '') ?: null,
            ($input['notif_time'] ?? '') ?: null,
            $image_path,
            $input['type'] ?? 'personal'
        ]);
        res(201, ['message' => 'Todo berhasil dibuat', 'id' => $pdo->lastInsertId()]);

    case 'PUT':
    case 'PATCH':
        if (!$id) res(400, ['error' => 'Bad Request: ID wajib disertakan']);
        $check = $pdo->prepare("SELECT * FROM todos WHERE id = ?");
        $check->execute([$id]);
        $old = $check->fetch();
        if (!$old) res(404, ['error' => 'Todo tidak ditemukan']);

        $stmt = $pdo->prepare("UPDATE todos SET title=?, description=?, deadline=?, notif_time=?, status=? WHERE id=?");
        $stmt->execute([
            trim($input['title'] ?? $old['title']),
            trim($input['description'] ?? $old['description']),
            array_key_exists('deadline', $input) ? ($input['deadline'] ?: null) : $old['deadline'],
            array_key_exists('notif_time', $input) ? ($input['notif_time'] ?: null) : $old['notif_time'],
            $input['status'] ?? $old['status'],
            $id
        ]);
        res(200, ['message' => 'Todo berhasil diperbarui']);

    case 'DELETE':
        if (!$id) res(400, ['error' => 'Bad Request: ID wajib disertakan']);
        $stmt = $pdo->prepare("DELETE FROM todos WHERE id = ?");
        $stmt->execute([$id]);
        $stmt->rowCount() ? res(200, ['message' => 'Todo berhasil dihapus']) : res(404, ['error' => 'Todo tidak ditemukan']);

    default:
        res(405, ['error' => 'Method Not Allowed']);
}
