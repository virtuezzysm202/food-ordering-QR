import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const categories = await prisma.category.findMany()
  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const body = await req.json()

  const category = await prisma.category.create({
    data: {
      name: body.name,
    },
  })

  return NextResponse.json(category)
}
