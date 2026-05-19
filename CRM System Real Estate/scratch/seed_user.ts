import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  
  if (userCount === 0) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@crm.com',
        name: 'Super Admin',
        passwordHash,
        role: 'BROKER',
      },
    });
    console.log('Default user created: admin@crm.com / admin123');
  } else {
    console.log(`System already has ${userCount} users.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
