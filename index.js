const dbName = "TodoAppDB";
const storeName = "todos";
let db;
let active_todo_id = null;

const todo_container = document.getElementById('todo-container');
const create_form = document.getElementById('create-todo-form');
const new_title_input = document.getElementById('new-title');
const new_desc_input = document.getElementById('new-description');
const new_deadline_input = document.getElementById('new-deadline');
const new_notif_input = document.getElementById('new-notif-time');
const new_image_data = document.getElementById('new-image-data');

const detail_title_input = document.getElementById('detail-title');
const detail_desc_input = document.getElementById('detail-description');
const detail_deadline_input = document.getElementById('detail-deadline');
const detail_notif_input = document.getElementById('detail-notif-time');
const detail_status_select = document.getElementById('detail-status');
const detail_image_preview = document.getElementById('detail-image-preview');
const btn_save_detail = document.getElementById('btn-save-detail');
const btn_delete_detail = document.getElementById('btn-delete-detail');


async function registerServiceWorkerAndNotif() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./sw.js');
        } catch (e) {
            console.warn("Service Worker gagal (gunakan local server/Live Server).");
        }
    }
    if ('Notification' in window && Notification.permission === 'default') {
        const result = await Notification.requestPermission(); //[cite: 75]
        if (result !== 'granted') console.log("Notifikasi ditolak");
    }
}

setInterval(async () => {
    if ("Notification" in window && Notification.permission === "granted" && db) {
        const todos = await getAllTodos();
        const currentTime = new Date().toTimeString().substring(0, 5); 

        todos.forEach(async (todo) => {
            if (todo.notifTime === currentTime && todo.status !== 'completed' && !todo.notified) {
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.showNotification(`Todo: ${todo.title}`, { 
                            body: todo.description,
                            icon: todo.image || null,
                            tag: `todo-${todo.id}`
                        });
                    });
                } else {
                    new Notification(`Todo: ${todo.title}`, { body: todo.description });
                }
                todo.notified = true;
                await saveTodoDB(todo);
            }
        });
    }
}, 60000); // 1 menit


const videoElement = document.getElementById('camera-video');
const cameraCanvas = document.getElementById('camera-canvas');
const newImagePreview = document.getElementById('new-image-preview');
const btnStartCamera = document.getElementById('btn-start-camera');
const btnTakePhoto = document.getElementById('btn-take-photo');
let mediaStream = null;

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

btnTakePhoto.addEventListener('click', () => {
    const context = cameraCanvas.getContext('2d');
    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;
    
    if (width && height) {
        cameraCanvas.width = width;
        cameraCanvas.height = height;
        context.drawImage(videoElement, 0, 0, width, height);
        
        const dataURL = cameraCanvas.toDataURL('image/png'); 
        new_image_data.value = dataURL;
        newImagePreview.src = dataURL;
        
        videoElement.style.display = 'none';
        newImagePreview.style.display = 'block';
        btnTakePhoto.style.display = 'none';
        btnStartCamera.style.display = 'block';
        btnStartCamera.innerText = "Ulangi Foto";

        // Stop stream
        mediaStream.getTracks().forEach(track => track.stop());
    }
});


function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1); 
        request.onupgradeneeded = (e) => { 
            db = e.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "id" }); 
            }
        };
        request.onsuccess = (e) => { db = e.target.result; resolve(db); };
        request.onerror = (e) => { console.error("IndexedDB error:", e.target.error); reject(e.target.error); };
    });
}

function getAllTodos() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readonly"); 
        const request = transaction.objectStore(storeName).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function saveTodoDB(todo) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readwrite");
        const request = transaction.objectStore(storeName).put(todo);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function deleteTodoDB(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readwrite");
        const request = transaction.objectStore(storeName).delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ==========================================
// 4. User Interface Logic
// ==========================================
async function render_todo_list() {
    todo_container.innerHTML = '';
    const todos = await getAllTodos();

    todos.forEach(todo => {
        const item_div = document.createElement('div');
        item_div.className = `todo-item ${todo.id === active_todo_id ? 'selected-item' : ''}`;
        item_div.dataset.id = todo.id;
        item_div.setAttribute('role', 'listitem'); 
        item_div.setAttribute('tabindex', '0'); 

        let status_class = todo.status === 'completed' ? 'completed' : todo.status === 'progress' ? 'progress' : 'not-started';
        let status_text = todo.status === 'completed' ? 'Selesai' : todo.status === 'progress' ? 'On Progress' : 'Belum Selesai';
        const is_checked = todo.status === 'completed' ? 'checked' : '';
        const title_style = todo.status === 'completed' ? 'text-decoration: line-through; opacity: 0.6;' : '';

        item_div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; pointer-events: none;">
                <input type="checkbox" class="todo-checkbox" data-id="${todo.id}" ${is_checked} style="pointer-events: auto;" aria-label="Tandai ${todo.title} selesai">
                <h3 style="${title_style}">${todo.title}</h3>
            </div>
            <span class="${status_class}">${status_text}</span>
        `;
        todo_container.appendChild(item_div);
    });

    document.querySelectorAll('.todo-item').forEach(item => {
        const handleClick = async function(e) {
            if (e.target.classList.contains('todo-checkbox')) return;
            await load_detail(Number(this.dataset.id));
            render_todo_list();
        };
        item.addEventListener('click', handleClick);
        item.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleClick.call(item, e); });
    });

    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', async function(e) {
            const id = Number(e.target.dataset.id);
            const todos = await getAllTodos();
            const todo = todos.find(t => t.id === id);
            if (todo) {
                todo.status = e.target.checked ? 'completed' : 'not-started';
                await saveTodoDB(todo);
                render_todo_list();
                if (active_todo_id === id) load_detail(id);
            }
        });
    });
}

async function load_detail(id) {
    const todos = await getAllTodos();
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    active_todo_id = id;
    detail_title_input.value = todo.title;
    detail_desc_input.value = todo.description;
    detail_deadline_input.value = todo.deadline;
    detail_notif_input.value = todo.notifTime || '';
    detail_status_select.value = todo.status;

    if (todo.image) {
        detail_image_preview.src = todo.image;
        detail_image_preview.style.display = 'block';
    } else {
        detail_image_preview.style.display = 'none';
        detail_image_preview.src = '';
    }

    [detail_title_input, detail_desc_input, detail_deadline_input, detail_notif_input].forEach(el => el.removeAttribute('readonly'));
    detail_status_select.removeAttribute('disabled');
    btn_save_detail.removeAttribute('disabled');
    btn_delete_detail.removeAttribute('disabled');
}

function reset_detail_form() {
    active_todo_id = null;
    document.getElementById('detail-form').reset();
    detail_image_preview.style.display = 'none';
    [detail_title_input, detail_desc_input, detail_deadline_input, detail_notif_input].forEach(el => el.setAttribute('readonly', 'true'));
    detail_status_select.setAttribute('disabled', 'true');
    btn_save_detail.setAttribute('disabled', 'true');
    btn_delete_detail.setAttribute('disabled', 'true');
}

create_form.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!new_title_input.value.trim()) return;

    try {
        const new_todo = {
            id: Date.now(),
            title: new_title_input.value,
            description: new_desc_input.value || '-',
            deadline: new_deadline_input.value || '-',
            notifTime: new_notif_input.value || null,
            image: new_image_data.value || null,
            status: 'not-started',
            notified: false
        };

        await saveTodoDB(new_todo);
        await render_todo_list();
        create_form.reset();
        new_image_data.value = '';
        newImagePreview.style.display = 'none';
        btnStartCamera.style.display = 'block';
        btnStartCamera.innerText = "Buka Kamera";
    } catch (err) { alert("Gagal menyimpan todo"); }
});

btn_save_detail.addEventListener('click', async function() {
    if (!active_todo_id) return;
    const todos = await getAllTodos();
    const todo = todos.find(t => t.id === active_todo_id);
    if (todo) {
        todo.title = detail_title_input.value;
        todo.description = detail_desc_input.value;
        todo.deadline = detail_deadline_input.value;
        if (todo.notifTime !== detail_notif_input.value) todo.notified = false;
        todo.notifTime = detail_notif_input.value;
        todo.status = detail_status_select.value;

        await saveTodoDB(todo);
        await render_todo_list();
        alert("Tersimpan!");
    }
});

btn_delete_detail.addEventListener('click', async function() {
    if (!active_todo_id) return;
    await deleteTodoDB(active_todo_id);
    reset_detail_form();
    await render_todo_list();
});

const theme_toggle_btn = document.getElementById('theme-toggle');

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        theme_toggle_btn.textContent = 'Light Mode';
    }
}

theme_toggle_btn.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light'); 
    theme_toggle_btn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
});

window.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    registerServiceWorkerAndNotif();
    try {
        await initDB();
        await render_todo_list();
    } catch (e) {
        console.error("Browser tidak mendukung penyimpanan offline.", e);
    }
});