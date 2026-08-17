import prisma from "../src/lib/prisma";
import { UserRole } from "../generated/prisma/enums";
import { hashPassword } from "../src/security/password";
import { env } from "../src/config/env";

async function main() {
  const passwordHash = await hashPassword(env.adminPassword);

  const admin = await prisma.user.upsert({
    where: {
      email: env.adminEmail,
    },
    update: {
      role: UserRole.ADMIN,
      passwordHash,
    },
    create: {
      name: "Admin",
      email: env.adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  console.log(`Admin ready: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
