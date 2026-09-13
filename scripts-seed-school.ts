import { prisma } from "./src/lib/prisma";

async function main() {
  const school = await prisma.school.upsert({
    where: {
      code: "BSIA",
    },
    update: {
      name: "BS INTERNATIONAL ACADEMY",
    },
    create: {
      name: "BS INTERNATIONAL ACADEMY",
      code: "BSIA",
    },
  });

  console.log("School ready:");
  console.log({
    id: school.id,
    name: school.name,
    code: school.code,
  });
}

main()
  .catch((error) => {
    console.error("School seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
