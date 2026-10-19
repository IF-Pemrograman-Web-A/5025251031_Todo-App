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

-- Insert Dummy Data
INSERT INTO todos (title, description, deadline, notif_time, image, status, type) VALUES
('Membeli Bahan Makanan', 'Beli sayur, buah, dan susu di minimarket', '2026-10-20', '08:00:00', NULL, 'not-started', 'personal'),
('Latihan Pemrograman PHP', 'Menyelesaikan modul migrasi Todo App ke PHP CRUD', '2026-10-22', '14:00:00', NULL, 'progress', 'personal'),
('Rapat Tim Proyek Iron Citadel', 'Diskusi arsitektur basis data dan integrasi API', '2026-10-25', '10:00:00', NULL, 'not-started', 'shared'),
('Review Code Frontend', 'Pemeriksaan aksesibilitas dan CSS layout', '2026-10-21', '16:30:00', NULL, 'completed', 'shared');