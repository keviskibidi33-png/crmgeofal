const jwt = require('jsonwebtoken');

// Crear un token JWT para el usuario admin
const user = {
  id: 6,
  name: 'Admin',
  email: 'admin@crm.com',
  role: 'admin'
};

const secret = process.env.JWT_SECRET || 'test';
const token = jwt.sign(user, secret, { expiresIn: '24h' });

console.log('🔑 Token JWT creado para admin:');
console.log(`Token: ${token}`);
console.log('\n📋 Información del usuario:');
console.log(`  ID: ${user.id}`);
console.log(`  Name: ${user.name}`);
console.log(`  Email: ${user.email}`);
console.log(`  Role: ${user.role}`);
console.log('\n🧪 Para probar el endpoint:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:4000/api/ensayos`);
