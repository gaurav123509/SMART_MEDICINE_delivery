-- ============================================
-- SMART MEDICINE DELIVERY NETWORK
-- Database Schema (MySQL/PostgreSQL)
-- ============================================

-- 1. USERS TABLE (Customers)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    profile_picture_url VARCHAR(255),
    default_address_id INT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    user_type ENUM('customer', 'seller', 'delivery_partner', 'admin') DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone_number),
    INDEX idx_email (email),
    INDEX idx_location (latitude, longitude)
);

-- 2. USER ADDRESSES TABLE
CREATE TABLE user_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT FALSE,
    address_type ENUM('home', 'work', 'other') DEFAULT 'home',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- 3. PHARMACIES/MEDICAL STORES TABLE
CREATE TABLE pharmacies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_user_id INT NOT NULL UNIQUE,
    pharmacy_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    drug_license_number VARCHAR(50) UNIQUE NOT NULL,
    drug_license_url VARCHAR(255),
    gst_number VARCHAR(15),
    gst_certificate_url VARCHAR(255),
    average_rating DECIMAL(3, 2) DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
    opening_time TIME,
    closing_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_city (city),
    INDEX idx_location (latitude, longitude),
    INDEX idx_verified (is_verified)
);

-- 4. MEDICINES TABLE
CREATE TABLE medicines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    manufacturer VARCHAR(100),
    strength VARCHAR(50),
    unit_type ENUM('tablet', 'syrup', 'injection', 'capsule', 'cream', 'powder', 'other') DEFAULT 'tablet',
    requires_prescription BOOLEAN DEFAULT FALSE,
    side_effects TEXT,
    usage_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category),
    UNIQUE KEY unique_medicine (name, strength, manufacturer)
);

-- 5. PHARMACY INVENTORY TABLE
CREATE TABLE pharmacy_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pharmacy_id INT NOT NULL,
    medicine_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    minimum_stock INT DEFAULT 10,
    is_available BOOLEAN DEFAULT TRUE,
    last_restocked TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    UNIQUE KEY unique_inventory (pharmacy_id, medicine_id),
    INDEX idx_pharmacy_id (pharmacy_id),
    INDEX idx_availability (is_available)
);

-- 6. ORDERS TABLE
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    pharmacy_id INT NOT NULL,
    delivery_address_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2),
    delivery_charges DECIMAL(10, 2),
    tax_amount DECIMAL(10, 2),
    is_express_delivery BOOLEAN DEFAULT FALSE,
    delivery_type ENUM('standard', 'express') DEFAULT 'standard',
    order_status ENUM('pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled', 'failed') DEFAULT 'pending',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_method ENUM('upi', 'card', 'wallet', 'cod') DEFAULT 'cod',
    delivery_time_estimated INT COMMENT 'in minutes',
    special_instructions TEXT,
    prescription_image_url VARCHAR(255),
    requires_verification BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_address_id) REFERENCES user_addresses(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_pharmacy_id (pharmacy_id),
    INDEX idx_status (order_status),
    INDEX idx_created_at (created_at)
);

-- 7. ORDER ITEMS TABLE
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
);

-- 8. DELIVERY PARTNERS TABLE
CREATE TABLE delivery_partners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(100),
    phone_number VARCHAR(15),
    vehicle_type ENUM('bike', 'car', 'bicycle', 'scooter') DEFAULT 'bike',
    vehicle_number VARCHAR(20),
    aadhar_number VARCHAR(20) UNIQUE,
    aadhar_url VARCHAR(255),
    dl_number VARCHAR(20) UNIQUE,
    dl_url VARCHAR(255),
    profile_picture_url VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_available BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    total_deliveries INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_available (is_available),
    INDEX idx_location (latitude, longitude)
);

-- 9. DELIVERY ASSIGNMENTS TABLE
CREATE TABLE delivery_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL UNIQUE,
    delivery_partner_id INT NOT NULL,
    pharmacy_id INT NOT NULL,
    pickup_location_id INT,
    delivery_address_id INT NOT NULL,
    assignment_status ENUM('assigned', 'accepted', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled') DEFAULT 'assigned',
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    otp_code VARCHAR(6),
    estimated_delivery_time TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    delivery_rating INT COMMENT '1-5 stars',
    delivery_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_address_id) REFERENCES user_addresses(id) ON DELETE CASCADE,
    INDEX idx_status (assignment_status),
    INDEX idx_partner_id (delivery_partner_id)
);

-- 10. RATINGS & REVIEWS TABLE
CREATE TABLE ratings_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    pharmacy_id INT NOT NULL,
    delivery_partner_id INT,
    rating_pharmacy INT COMMENT '1-5 stars',
    rating_delivery INT COMMENT '1-5 stars',
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE CASCADE,
    INDEX idx_pharmacy_id (pharmacy_id),
    INDEX idx_user_id (user_id)
);

-- 11. PAYMENTS TABLE
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('upi', 'card', 'wallet', 'cod') DEFAULT 'cod',
    payment_gateway_id VARCHAR(100),
    transaction_id VARCHAR(100) UNIQUE,
    payment_status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
    failure_reason TEXT,
    refund_amount DECIMAL(10, 2),
    refund_status ENUM('none', 'pending', 'completed', 'failed') DEFAULT 'none',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_status (payment_status)
);

-- 12. ADMIN ANALYTICS TABLE
CREATE TABLE admin_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    average_order_value DECIMAL(10, 2),
    active_users INT DEFAULT 0,
    active_pharmacies INT DEFAULT 0,
    active_delivery_partners INT DEFAULT 0,
    express_delivery_count INT DEFAULT 0,
    standard_delivery_count INT DEFAULT 0,
    cancelled_orders INT DEFAULT 0,
    successful_deliveries INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date)
);

-- 13. SUPPORT TICKETS TABLE
CREATE TABLE support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT,
    pharmacy_id INT,
    order_id INT,
    category ENUM('order_issue', 'delivery_issue', 'payment_issue', 'product_issue', 'general') DEFAULT 'general',
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_user_id (user_id)
);

-- 14. DELIVERY RADIUS & PRICING TABLE
CREATE TABLE delivery_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pharmacy_id INT NOT NULL UNIQUE,
    free_delivery_radius_km DECIMAL(5, 2) DEFAULT 2.5,
    standard_delivery_charge DECIMAL(10, 2) DEFAULT 0,
    express_delivery_charge DECIMAL(10, 2) DEFAULT 30,
    express_delivery_minutes INT DEFAULT 20,
    is_express_available BOOLEAN DEFAULT TRUE,
    commission_percentage DECIMAL(5, 2) DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    INDEX idx_pharmacy_id (pharmacy_id)
);

-- 15. DEMAND FORECAST TABLE (For AI optimization)
CREATE TABLE demand_forecast (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pharmacy_id INT NOT NULL,
    medicine_id INT NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_quantity INT,
    actual_quantity INT,
    confidence_score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    UNIQUE KEY unique_forecast (pharmacy_id, medicine_id, forecast_date),
    INDEX idx_pharmacy_id (pharmacy_id)
);

-- 16. CART TABLE (Temporary - for session management)
CREATE TABLE shopping_cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    pharmacy_id INT,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 HOUR)),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);
CREATE INDEX idx_orders_pharmacy_status ON orders(pharmacy_id, order_status);
CREATE INDEX idx_delivery_partner_available ON delivery_partners(is_available, user_id);
CREATE INDEX idx_inventory_stock ON pharmacy_inventory(pharmacy_id, stock_quantity);
CREATE INDEX idx_pharmacy_location_active ON pharmacies(latitude, longitude, is_active);

-- ============================================
-- SAMPLE DATA INSERTIONS (Optional)
-- ============================================

-- Sample categories for medicines
INSERT INTO medicines (name, description, category, strength, unit_type) VALUES
('Paracetamol', 'Common painkiller and fever reducer', 'Pain Relief', '500mg', 'tablet'),
('Ibuprofen', 'Anti-inflammatory medicine', 'Pain Relief', '200mg', 'tablet'),
('Aspirin', 'Blood thinner and painkiller', 'Cardiology', '75mg', 'tablet'),
('Amoxicillin', 'Antibiotic for bacterial infections', 'Antibiotics', '500mg', 'capsule'),
('Metformin', 'Diabetes management', 'Endocrinology', '500mg', 'tablet'),
('Atorvastatin', 'Cholesterol reducer', 'Cardiology', '10mg', 'tablet'),
('Omeprazole', 'Acid reflux treatment', 'Gastroenterology', '20mg', 'capsule'),
('Cetirizine', 'Antihistamine for allergies', 'Allergy', '10mg', 'tablet'),
('Vitamin D3', 'Vitamin supplement', 'Supplements', '1000IU', 'tablet'),
('Multivitamin Syrup', 'General wellness', 'Supplements', 'Multi', 'syrup');

-- ============================================
-- END OF SCHEMA
-- ============================================
