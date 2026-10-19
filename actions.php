<?php
require_once 'config.php';

$action = $_REQUEST['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create') {
    $title = trim($_POST['title']);
    $description = trim($_POST['description']);
    $deadline = $_POST['deadline'] ?: null;
    $notif_time = $_POST['notif_time'] ?: null;
    $type = $_POST['type'] ?? 'personal';
    $image_path = null;

    
    if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['image_file']['tmp_name'];
        $fileName = time() . '_' . basename($_FILES['image_file']['name']);
        $targetPath = $upload_dir . $fileName;
        
        if (move_uploaded_file($fileTmpPath, $targetPath)) {
            $image_path = 'uploads/' . $fileName;
        }
    } elseif (!empty($_POST['camera_image_data'])) {
        $data = $_POST['camera_image_data'];
        if (preg_match('/^data:image\/(\w+);base64,/', $data, $type_img)) {
            $data = substr($data, strpos($data, ',') + 1);
            $data = base64_decode($data);
            $fileName = time() . '_camera.png';
            file_put_contents($upload_dir . $fileName, $data);
            $image_path = 'uploads/' . $fileName;
        }
    }

    $stmt = $pdo->prepare("INSERT INTO todos (title, description, deadline, notif_time, image, status, type) VALUES (?, ?, ?, ?, ?, 'not-started', ?)");
    $stmt->execute([$title, $description, $deadline, $notif_time, $image_path, $type]);

    header("Location: index.php?type=" . $type);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update') {
    $id = $_POST['id'];
    $title = trim($_POST['title']);
    $description = trim($_POST['description']);
    $deadline = $_POST['deadline'] ?: null;
    $notif_time = $_POST['notif_time'] ?: null;
    $status = $_POST['status'];
    $type = $_POST['type'] ?? 'personal';

    $stmt = $pdo->prepare("UPDATE todos SET title = ?, description = ?, deadline = ?, notif_time = ?, status = ? WHERE id = ?");
    $stmt->execute([$title, $description, $deadline, $notif_time, $status, $id]);

    header("Location: index.php?type=" . $type);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete') {
    $id = $_POST['id'];
    $type = $_POST['type'] ?? 'personal';


    $stmt = $pdo->prepare("SELECT image FROM todos WHERE id = ?");
    $stmt->execute([$id]);
    $todo = $stmt->fetch();
    if ($todo && $todo['image'] && file_exists(__DIR__ . '/' . $todo['image'])) {
        unlink(__DIR__ . '/' . $todo['image']);
    }

    $stmt = $pdo->prepare("DELETE FROM todos WHERE id = ?");
    $stmt->execute([$id]);

    header("Location: index.php?type=" . $type);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'toggle_status') {
    $id = $_POST['id'];
    $status = $_POST['status'];
    
    $stmt = $pdo->prepare("UPDATE todos SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    
    echo json_encode(['success' => true]);
    exit;
}
?>
