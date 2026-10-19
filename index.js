document.addEventListener('DOMContentLoaded', () => {
    const theme_toggle_btn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (theme_toggle_btn) theme_toggle_btn.textContent = 'Light Mode';
    }

    if (theme_toggle_btn) {
        theme_toggle_btn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            theme_toggle_btn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        });
    }

    const todoItems = document.querySelectorAll('.todo-item');
    const detailId = document.getElementById('detail-id');
    const detailTitle = document.getElementById('detail-title');
    const detailDesc = document.getElementById('detail-description');
    const detailDeadline = document.getElementById('detail-deadline');
    const detailNotif = document.getElementById('detail-notif-time');
    const detailStatus = document.getElementById('detail-status');
    const detailImg = document.getElementById('detail-image-preview');
    const btnSave = document.getElementById('btn-save-detail');
    const btnDelete = document.getElementById('btn-delete-detail');

    todoItems.forEach(item => {
        const selectItem = () => {
            todoItems.forEach(i => i.classList.remove('selected-item'));
            item.classList.add('selected-item');

            const todo = JSON.parse(item.dataset.todo);
            detailId.value = todo.id;
            detailTitle.value = todo.title;
            detailDesc.value = todo.description;
            detailDeadline.value = todo.deadline || '';
            detailNotif.value = todo.notif_time || '';
            detailStatus.value = todo.status;

            if (todo.image) {
                detailImg.src = todo.image;
                detailImg.style.display = 'block';
            } else {
                detailImg.style.display = 'none';
                detailImg.src = '';
            }

            [detailTitle, detailDesc, detailDeadline, detailNotif].forEach(el => el.removeAttribute('readonly'));
            detailStatus.removeAttribute('disabled');
            btnSave.removeAttribute('disabled');
            btnDelete.removeAttribute('disabled');
        };

        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('todo-checkbox')) selectItem();
        });

        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') selectItem();
        });
    });

    const checkboxes = document.querySelectorAll('.todo-checkbox');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', async (e) => {
            const id = e.target.dataset.id;
            const newStatus = e.target.checked ? 'completed' : 'not-started';

            const formData = new FormData();
            formData.append('action', 'toggle_status');
            formData.append('id', id);
            formData.append('status', newStatus);

            await fetch('actions.php', { method: 'POST', body: formData });
            window.location.reload();
        });
    });

    const videoElement = document.getElementById('camera-video');
    const cameraCanvas = document.getElementById('camera-canvas');
    const newImagePreview = document.getElementById('new-image-preview');
    const btnStartCamera = document.getElementById('btn-start-camera');
    const btnTakePhoto = document.getElementById('btn-take-photo');
    const newImageData = document.getElementById('new-image-data');
    let mediaStream = null;

    if (btnStartCamera) {
        btnStartCamera.addEventListener('click', async () => {
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoElement.srcObject = mediaStream;
                videoElement.style.display = 'block';
                btnStartCamera.style.display = 'none';
                btnTakePhoto.style.display = 'block';
                newImagePreview.style.display = 'none';
            } catch (err) {
                alert("Gagal mengakses kamera: " + err.message);
            }
        });
    }

    if (btnTakePhoto) {
        btnTakePhoto.addEventListener('click', () => {
            const context = cameraCanvas.getContext('2d');
            const width = videoElement.videoWidth;
            const height = videoElement.videoHeight;

            if (width && height) {
                cameraCanvas.width = width;
                cameraCanvas.height = height;
                context.drawImage(videoElement, 0, 0, width, height);

                const dataURL = cameraCanvas.toDataURL('image/png');
                newImageData.value = dataURL;
                newImagePreview.src = dataURL;

                videoElement.style.display = 'none';
                newImagePreview.style.display = 'block';
                btnTakePhoto.style.display = 'none';
                btnStartCamera.style.display = 'block';
                btnStartCamera.innerText = "Ulangi Foto";

                if (mediaStream) {
                    mediaStream.getTracks().forEach(track => track.stop());
                }
            }
        });
    }
});
