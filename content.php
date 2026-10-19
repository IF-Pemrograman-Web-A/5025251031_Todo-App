<?php
$current_type = isset($_GET['type']) && $_GET['type'] === 'shared' ? 'shared' : 'personal';

$stmt = $pdo->prepare("SELECT * FROM todos WHERE type = ? ORDER BY created_at DESC");
$stmt->execute([$current_type]);
$todos = $stmt->fetchAll();
?>

<main id="main-content" class="container" tabindex="-1">
    <?php include 'menu-bar.php'; ?>

    <section class="todo-panel" aria-labelledby="todo-heading">
        <h2 id="todo-heading"><?= ucfirst($current_type) ?> Todos</h2>
        <div id="todo-container" role="list">
            <?php if (empty($todos)): ?>
                <p style="padding: 10px; opacity: 0.7;">Belum ada tugas di kategori ini.</p>
            <?php else: ?>
                <?php foreach ($todos as $todo): ?>
                    <?php 
                        $status_class = $todo['status'] === 'completed' ? 'completed' : ($todo['status'] === 'progress' ? 'progress' : 'not-started');
                        $status_text = $todo['status'] === 'completed' ? 'Selesai' : ($todo['status'] === 'progress' ? 'On Progress' : 'Belum Selesai');
                        $is_checked = $todo['status'] === 'completed' ? 'checked' : '';
                        $title_style = $todo['status'] === 'completed' ? 'text-decoration: line-through; opacity: 0.6;' : '';
                    ?>
                    <div class="todo-item" data-todo='<?= htmlspecialchars(json_encode($todo), ENT_QUOTES, 'UTF-8') ?>' role="listitem" tabindex="0">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" class="todo-checkbox" data-id="<?= $todo['id'] ?>" <?= $is_checked ?> aria-label="Tandai selesai">
                            <h3 style="<?= $title_style ?>"><?= htmlspecialchars($todo['title']) ?></h3>
                        </div>
                        <span class="<?= $status_class ?>"><?= $status_text ?></span>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </section>

    <div class="right-column">
        <aside class="detail-panel" aria-labelledby="detail-heading">
            <h2 id="detail-heading">Todo Detail</h2>
            <form id="detail-form" method="POST" action="actions.php">
                <input type="hidden" name="id" id="detail-id">
                <input type="hidden" name="type" value="<?= $current_type ?>">

                <label for="detail-title">Todo Title</label>
                <input type="text" name="title" id="detail-title" readonly placeholder="Klik item todo di kiri untuk melihat">

                <label for="detail-description">Description</label>
                <textarea name="description" id="detail-description" rows="3" readonly></textarea>
                
                <label for="detail-deadline">Deadline</label>
                <input type="date" name="deadline" id="detail-deadline" readonly>

                <label for="detail-notif-time">Waktu Notifikasi</label>
                <input type="time" name="notif_time" id="detail-notif-time" readonly>

                <p style="margin-top: 10px; font-weight: bold; font-size: 0.9rem;">Gambar Todo</p>
                <img id="detail-image-preview" src="" alt="Preview gambar detail todo" style="display: none; max-width: 100%; border-radius: 5px;">

                <label for="detail-status">Status Progress</label>
                <select name="status" id="detail-status" disabled>
                    <option value="not-started">Belum Selesai</option>
                    <option value="progress">On Progress</option>
                    <option value="completed">Selesai</option>
                </select>

                <div class="button-group">
                    <button type="submit" formaction="actions.php?action=delete" id="btn-delete-detail" class="btn btn-delete" disabled aria-label="Hapus Todo">Hapus</button>
                    <button type="submit" formaction="actions.php?action=update" id="btn-save-detail" class="btn" disabled aria-label="Simpan perubahan detail Todo">Simpan Perubahan</button>
                </div>
            </form>
        </aside>

        <aside class="create-panel" aria-labelledby="create-heading">
            <h2 id="create-heading">Create New Todo</h2>
            <form id="create-todo-form" method="POST" action="actions.php" enctype="multipart/form-data">
                <input type="hidden" name="action" value="create">
                <input type="hidden" name="type" value="<?= $current_type ?>">

                <label for="new-title">Todo Title</label>
                <input type="text" name="title" id="new-title" placeholder="Enter todo title" required aria-required="true">

                <label for="new-description">Description</label>
                <textarea name="description" id="new-description" rows="3" placeholder="Enter description"></textarea>

                <label for="new-deadline">Deadline</label>
                <input type="date" name="deadline" id="new-deadline">

                <label for="new-notif-time">Waktu Notifikasi</label>
                <input type="time" name="notif_time" id="new-notif-time">

                <label for="new-image-file">Upload Gambar</label>
                <input type="file" name="image_file" id="new-image-file" accept="image/*">

                <p style="margin-top: 10px; font-weight: bold; font-size: 0.9rem;">Atau Ambil Gambar (Kamera)</p>
                <video id="camera-video" width="100%" autoplay playsinline style="display: none; background: #000; border-radius:5px;"></video>
                <canvas id="camera-canvas" style="display: none; width: 100%;"></canvas>
                <img id="new-image-preview" src="" alt="Hasil tangkapan kamera" style="display: none; margin-top: 10px; max-width: 100%; border-radius: 5px;">
                
                <div class="button-group" style="margin-top: 5px; justify-content: flex-start;">
                    <button type="button" id="btn-start-camera" class="btn btn-sm">Buka Kamera</button>
                    <button type="button" id="btn-take-photo" class="btn btn-sm" style="display:none;">Jepret Foto</button>
                </div>
                <input type="hidden" name="camera_image_data" id="new-image-data">

                <div class="button-group">
                    <button type="submit" class="btn" aria-label="Tambah Todo Baru">Add Todo</button>
                </div>
            </form>
        </aside>
    </div>
</main>
