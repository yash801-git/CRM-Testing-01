import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const leads = await prisma.lead.count();
  const properties = await prisma.property.count();
  const deals = await prisma.deal.count();
  const visits = await prisma.siteVisit.count();
  const tasks = await prisma.task.count();

  console.log(JSON.stringify({
    users,
    leads,
    properties,
    deals,
    visits,
    tasks
  }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
