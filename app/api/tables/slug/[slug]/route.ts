import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET table by slug
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug

  if (!slug) {
    return NextResponse.json({ error: 'Slug not provided' }, { status: 400 })
  }

  const table = await prisma.table.findUnique({
    where: { slug },
  })

  if (!table) {
    return NextResponse.json({ error: 'Table not found' }, { status: 404 })
  }

  return NextResponse.json(table)
}

