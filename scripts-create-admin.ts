import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { prisma } from "./src/lib/prisma";
import { hashPassword } from "./src/lib/password";

const SCHOOL_CODE = "BSIA";

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    const email = (await rl.question("Admin email: ")).trim().toLowerCase();
    const firstName = (await rl.question("First name: ")).trim();
    const lastName = (await rl.question("Last name: ")).trim();
    const password = await rl.question("Password: ", {
    });

    if (!email || !firstName || !lastName || !password) {
      throw new Error("All fields are required");
    }

    if (password.length < 8) {
      throw new Error("Password must contain at least 8 characters");
    }

    const school = await prisma.school.findUnique({
      where: { code: SCHOOL_CODE },
      select: { id: true, name: true },
    });

    if (!school) {
      throw new Error(`School with code ${SCHOOL_CODE} was not found`);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: "ADMIN",
        schoolId: school.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        schoolId: true,
      },
    });

    console.log("\nAdmin account created successfully:");
    console.log(user);
  } finally {
    rl.close();
  }
}

main()
  .catch((error) => {
    console.error("\nAdmin creation failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
