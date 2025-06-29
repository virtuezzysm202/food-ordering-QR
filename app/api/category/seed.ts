// app/api/category/seed.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const existing = await prisma.category.findMany()

  if (existing.length === 0) {
    await prisma.category.createMany({
      data: [{ name: 'Food' }, { name: 'Drink' }],
    })
  }

  return NextResponse.json({ success: true })
}
