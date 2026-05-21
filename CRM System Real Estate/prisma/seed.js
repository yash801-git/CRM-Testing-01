const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const path = require('path');

// Load environment variables from the root .env file relative to this script
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Admin Broker';

  if (!email || !password) {
    console.error('Error: Please provide email and password.');
    console.log('Usage: node prisma/seed.js <email> <password> ["Name"]');
    process.exit(1);
  }

  console.log(`Preparing to seed Admin Broker: "${name}" <${email}>...`);

  // Hash the password with bcrypt (rounds = 10)
  const passwordHash = await bcrypt.hash(password, 10);

  // Use upsert to create the account if it doesn't exist, or update password if it does
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: 'BROKER',
    },
    create: {
      email,
      name,
      passwordHash,
      role: 'BROKER',
      isActive: true,
    },
  });

  console.log('==================================================');
  console.log('SUCCESS: Admin Broker account initialized!');
  console.log('ID:      ', user.id);
  console.log('Name:    ', user.name);
  console.log('Email:   ', user.email);
  console.log('Role:    ', user.role);
  console.log('Active:  ', user.isActive);
  console.log('==================================================');
}

main()
  .catch((e) => {
    console.error('SEED ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
