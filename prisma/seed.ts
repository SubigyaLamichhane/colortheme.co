import { prisma } from "../src/lib/db";

async function main() {
  // Minimal seed: ensure one example palette exists
  await prisma.palette.upsert({
    where: { id: "sunset" },
    update: {},
    create: {
      id: "sunset",
      slug: "sunset",
      name: "Sunset",
      colors: ["#ff5e57", "#ff9966", "#ffcc66", "#ffeead"],
    },
  });

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
