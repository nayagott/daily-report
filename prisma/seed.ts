/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
})

const prisma = new PrismaClient({ adapter })

const TEST_USERS = [
  {
    name: "홍길동",
    email: "sales1@test.com",
    password: "password1234",
    role: "SALES" as const,
    department: "영업1팀",
  },
  {
    name: "김영업",
    email: "sales2@test.com",
    password: "password1234",
    role: "SALES" as const,
    department: "영업2팀",
  },
  {
    name: "이부장",
    email: "manager1@test.com",
    password: "password1234",
    role: "MANAGER" as const,
    department: "영업본부",
  },
]

const TEST_CUSTOMERS = [
  {
    companyName: "(주)테스트전자",
    contactName: "김철수",
    phone: "010-1234-5678",
    industry: "전자",
  },
  {
    companyName: "(주)샘플화학",
    contactName: "이영희",
    phone: "010-9876-5432",
    industry: "화학",
  },
]

async function main() {
  console.log("🌱 Seeding database...")

  // 사용자 생성
  for (const user of TEST_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10)
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
        department: user.department,
      },
    })
    console.log(`  ✓ User: ${user.name} (${user.email})`)
  }

  // 고객 생성
  for (const customer of TEST_CUSTOMERS) {
    await prisma.customer.upsert({
      where: { companyName: customer.companyName },
      update: {},
      create: customer,
    })
    console.log(`  ✓ Customer: ${customer.companyName}`)
  }

  console.log("✅ Seeding completed.")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
