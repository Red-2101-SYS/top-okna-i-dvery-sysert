import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL || "admin@top-okna.local";
const password = process.env.ADMIN_PASSWORD || "Admin12345!";

async function main() {
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash },
    create: { email, password: hash, role: "admin", name: "Admin" },
  });

  console.log("✅ Admin user ready:");
  console.log("Email:", user.email);
  console.log("Password:", password);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
