/**
 * Script to generate bcrypt hash for admin user password
 * Usage: node scripts/generate-admin-hash.js <password>
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'Admin123!';

const hash = bcrypt.hashSync(password, 10);

console.log('\n===============================================');
console.log('Generated Bcrypt Hash for Admin User');
console.log('===============================================\n');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nCopy this hash into your supabase/seed.sql file');
console.log('===============================================\n');
