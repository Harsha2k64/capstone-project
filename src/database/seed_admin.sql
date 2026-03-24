USE ecommerce;
DELETE FROM users WHERE email = 'admin@admin.com';
INSERT INTO users (id, user_type, name, password, email) VALUES
(1, 'admin', 'Admin', '$2b$10$h/kKGgYBj1fsrf1HYLGfeeiwPllq2cja17ichrnjBm9TT8b8WiNBO', 'admin@admin.com');
