-- Seed file for initial development data
-- This file creates an initial admin user for testing

-- Insert initial admin user
-- Email: admin@animatic.com
-- Password: Admin123! (hashed with bcrypt)
-- Note: Change this password in production!

INSERT INTO users (email, password_hash, name, role)
VALUES (
    'admin@animatic.com',
    '$2a$10$YourHashedPasswordHere', -- This will be replaced by actual bcrypt hash
    'Admin User',
    'super_admin'
)
ON CONFLICT (email) DO NOTHING;

-- Note: To generate a bcrypt hash for your password, run:
-- node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your_password', 10));"
