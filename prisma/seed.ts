import { prisma } from "../src/lib/db";

async function main() {
  // Create a demo user for local testing
  const user = await prisma.user.upsert({
    where: { email: "demo@local" },
    update: {},
    create: { email: "demo@local" },
  });

  // Example palette
  await prisma.palette.upsert({
    where: { slug: "sunset" },
    update: {},
    create: {
      slug: "sunset",
      name: "Sunset",
      colors: ["#ff5e57", "#ff9966", "#ffcc66", "#ffeead"],
    },
  });

  console.log("Seed completed for user:", user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
