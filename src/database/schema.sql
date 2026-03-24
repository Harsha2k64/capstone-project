CREATE DATABASE IF NOT EXISTS ecommerce
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecommerce;

CREATE TABLE IF NOT EXISTS users (
  id         INT          NOT NULL AUTO_INCREMENT,
  user_type  VARCHAR(50)  DEFAULT NULL,
  name       VARCHAR(100) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  email      VARCHAR(100) NOT NULL,
  phone      VARCHAR(20)  DEFAULT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id          INT          NOT NULL AUTO_INCREMENT,
  title       VARCHAR(100) DEFAULT NULL,
  description VARCHAR(500) DEFAULT NULL,
  image_url   VARCHAR(500) DEFAULT NULL,
  category    VARCHAR(100) DEFAULT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sizes (
  product_id INT           NOT NULL,
  size       VARCHAR(10)   DEFAULT NULL,
  price      DECIMAL(10,2) DEFAULT NULL,
  stock      INT           DEFAULT NULL,
  KEY product_id_idx (product_id),
  CONSTRAINT sizes_ibfk_1 FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cart (
  user_id INT  NOT NULL,
  content JSON DEFAULT NULL,
  PRIMARY KEY (user_id),
  CONSTRAINT cart_user_fk FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id             INT           NOT NULL AUTO_INCREMENT,
  customer_id    INT           NOT NULL,
  address        VARCHAR(200)  DEFAULT NULL,
  city           VARCHAR(100)  DEFAULT NULL,
  state          VARCHAR(100)  DEFAULT NULL,
  zip            VARCHAR(20)   DEFAULT NULL,
  card_last4     VARCHAR(4)    DEFAULT NULL,
  transaction_id VARCHAR(100)  DEFAULT NULL,
  total_amount   DECIMAL(10,2) DEFAULT NULL,
  status         VARCHAR(50)   DEFAULT 'confirmed',
  created_at     DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id_idx (customer_id),
  CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders_items (
  order_id   INT           NOT NULL,
  item_id    INT           NOT NULL,
  quantity   INT           NOT NULL,
  size       VARCHAR(45)   NOT NULL,
  unit_price DECIMAL(10,2) DEFAULT NULL,
  CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_product FOREIGN KEY (item_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO products (id, title, description) VALUES
(1,'The Original','Hamburger 100% Beef, american cheese, bacon, tomato, lettuce and our famous sauce.'),
(2,'Pretzel Triple','Warm beer cheese sauce, smoked bacon, crispy fried onions, extra soft pretzel bun.'),
(3,'Baconation','Fresh Beef, 6 pieces of crispy smoked bacon, american cheese, ketchup and mayo.'),
(4,'Bacon Jalapeño','Fresh beef with pickled jalapeños, smoked bacon, American cheese, crispy fried onions.'),
(5,'Cheeseburger Deluxe','100% Beef topped with cheese, pickles, onions, tomatoes, crisp lettuce, ketchup and mayo.'),
(6,'Big Bacon','A quarter-pound of fresh beef, bacon, crisp lettuce, tomato, pickle, ketchup, mayo and onion.');

INSERT IGNORE INTO sizes VALUES
(1,'LARGE',10.50,9),(1,'MEDIUM',9.50,7),(1,'SMALL',8.50,3),
(2,'LARGE',10.00,4),(2,'MEDIUM',9.25,11),(2,'SMALL',7.10,0),
(3,'LARGE',11.00,4),(3,'MEDIUM',9.25,0),(3,'SMALL',6.10,20),
(4,'LARGE',11.50,11),(4,'MEDIUM',10.00,22),(4,'SMALL',9.50,8),
(5,'LARGE',9.00,22),(5,'MEDIUM',8.00,10),(5,'SMALL',7.00,3),
(6,'LARGE',10.50,0),(6,'MEDIUM',9.50,0),(6,'SMALL',7.50,7);


INSERT IGNORE INTO users (id, user_type, name, password, email) VALUES
(1,'admin','Admin','$2b$10$h/kKGgYBj1fsrf1HYLGfeeiwPllq2cja17ichrnjBm9TT8b8WiNBO','admin@admin.com');