CREATE DATABASE IF NOT EXISTS todo_app_db;
USE todo_app_db;

CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE,
    notif_time TIME,
    image VARCHAR(255) DEFAULT NULL,
    status ENUM('not-started', 'progress', 'completed') DEFAULT 'not-started',
    type ENUM('personal', 'shared') DEFAULT 'personal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO todos (title, description, deadline, notif_time, image, status, type) VALUES
('Belajar ETS PWeb', 'Persiapan dan pemahaman materi Evaluasi Tengah Semester Pemrograman Web', '2026-10-20', '08:00:00', NULL, 'not-started', 'personal'),
('Belajar ETS PBO', 'Latihan soal dan konsep Object-Oriented Programming untuk ETS PBO', '2026-10-22', '14:00:00', NULL, 'progress', 'personal'),
('Menyelesaikan ETS KPPL', 'Pengerjaan tugas kelompok Evaluasi Tengah Semester KPPL', '2026-10-25', '10:00:00', NULL, 'not-started', 'shared'),
('Menyelesaikan Proker', 'Koordinasi dan penyelesaian program kerja kelompok', '2026-10-21', '16:30:00', NULL, 'completed', 'shared');
