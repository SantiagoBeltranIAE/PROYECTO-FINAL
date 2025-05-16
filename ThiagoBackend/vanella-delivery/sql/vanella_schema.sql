CREATE DATABASE vanella_delivery;
USE vanella_delivery;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL
);

-- Crear usuarios por defecto
INSERT INTO users (username, password, role) VALUES
('admin', SHA2('admin123', 256), 'admin'),
('user', SHA2('user123', 256), 'user');
