const todo_default = [
    {
        id: 1,
        title: "Mencuci baju",
        description: "Mencuci baju kotor hingga bersih",
        deadline: "2026-10-15",
        status: "completed"
    },
    {
        id: 2,
        title: "Mengerjakan Praktikum Jarkom",
        description: "Mengerjakan praktikum modul pertama jarkom.",
        deadline: "2026-10-20",
        status: "progress"
    },
    {
        id: 3,
        title: "Mangerjakan Tugas pak Rully",
        description: "Tugas perkuliahan modul JS",
        deadline: "2026-10-25",
        status: "not-started"
    }
];

let todos = [...todo_default];
let active_todo_id = null;


const todo_container = document.getElementById('todo-container');
const create_form = document.getElementById('create-todo-form');
const new_title_input = document.getElementById('new-title');
const new_desc_input = document.getElementById('new-description');
const new_deadline_input = document.getElementById('new-deadline');

const detail_title_input = document.getElementById('detail-title');
const detail_desc_input = document.getElementById('detail-description');
const detail_deadline_input = document.getElementById('detail-deadline');
const detail_status_select = document.getElementById('detail-status');
const btn_save_detail = document.getElementById('btn-save-detail');
const btn_delete_detail = document.getElementById('btn-delete-detail');

const theme_toggle_btn = document.getElementById('theme-toggle');


function render_todo_list() {
    todo_container.innerHTML = '';

    todos.forEach(todo => {
        const item_div = document.createElement('div');
        item_div.className = `todo-item ${todo.id === active_todo_id ? 'selected-item' : ''}`;
        item_div.dataset.id = todo.id;

        let status_class = 'not-started';
        let status_text = 'Not Completed';

        if (todo.status === 'completed') {
            status_class = 'completed';
            status_text = 'Completed';
        } else if (todo.status === 'progress') {
            status_class = 'progress';
            status_text = 'On Progress';
        }

        const is_checked = todo.status === 'completed' ? 'checked' : '';
        const title_style = todo.status === 'completed' ? 'text-decoration: line-through; opacity: 0.6;' : '';

        item_div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; pointer-events: none;">
                <input type="checkbox" class="todo-checkbox" data-id="${todo.id}" ${is_checked} style="pointer-events: auto;">
                <h3 style="${title_style}">${todo.title}</h3>
            </div>
            <span class="${status_class}">${status_text}</span>
        `;

        todo_container.appendChild(item_div);
    });

    attach_event_listeners();
}

function attach_event_listeners() {
    document.querySelectorAll('.todo-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.classList.contains('todo-checkbox')) return;

            const id = Number(this.dataset.id);
            load_detail(id);
            render_todo_list();
        });
    });

    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function(e) {
            const id = Number(e.target.dataset.id);
            const todo = todos.find(t => t.id === id);
            if (todo) {
                todo.status = e.target.checked ? 'completed' : 'not-started';
                render_todo_list();
                if (active_todo_id === id) load_detail(id);
            }
        });
    });
}

function load_detail(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    active_todo_id = id;
    detail_title_input.value = todo.title;
    detail_desc_input.value = todo.description;
    detail_deadline_input.value = todo.deadline;
    detail_status_select.value = todo.status;

    detail_title_input.removeAttribute('readonly');
    detail_desc_input.removeAttribute('readonly');
    detail_deadline_input.removeAttribute('readonly');
}

function reset_detail_form() {
    active_todo_id = null;
    detail_title_input.value = '';
    detail_desc_input.value = '';
    detail_deadline_input.value = '';
    detail_status_select.value = 'not-started';
    detail_title_input.setAttribute('readonly', 'true');
    detail_desc_input.setAttribute('readonly', 'true');
    detail_deadline_input.setAttribute('readonly', 'true');
}

function delete_todo(id) {
    todos = todos.filter(t => t.id !== id);
    if (active_todo_id === id) {
        reset_detail_form();
    }
    render_todo_list();
}

create_form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (!new_title_input.value.trim()) {
        alert("Judul Todo tidak boleh kosong!");
        return;
    }

    const new_todo = {
        id: Date.now(),
        title: new_title_input.value,
        description: new_desc_input.value || '-',
        deadline: new_deadline_input.value || '-',
        status: 'not-started'
    };

    todos.push(new_todo);
    render_todo_list();
    create_form.reset();
});

btn_save_detail.addEventListener('click', function() {
    if (!active_todo_id) {
        alert("Klik salah satu Todo dari daftar terlebih dahulu!");
        return;
    }

    const todo = todos.find(t => t.id === active_todo_id);
    if (todo) {
        todo.title = detail_title_input.value;
        todo.description = detail_desc_input.value;
        todo.deadline = detail_deadline_input.value;
        todo.status = detail_status_select.value;
        render_todo_list();
        alert("Perubahan Todo berhasil disimpan!");
    }
});

btn_delete_detail.addEventListener('click', function() {
    if (!active_todo_id) {
        alert("Klik salah satu Todo dari daftar yang ingin dihapus terlebih dahulu!");
        return;
    }
    delete_todo(active_todo_id);
});

theme_toggle_btn.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        theme_toggle_btn.textContent = 'Light Mode';
    } else {
        theme_toggle_btn.textContent = 'Dark Mode';
    }
});

render_todo_list();