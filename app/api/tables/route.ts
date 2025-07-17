// app/api/tables/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const tables = await prisma.table.findMany()
  return NextResponse.json(tables)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, slug } = body

  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
  }

  const existing = await prisma.table.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
  }

  const newTable = await prisma.table.create({
    data: { name, slug },
  })

  return NextResponse.json(newTable, { status: 201 })
}
