import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get('customerId')
  const table = req.nextUrl.searchParams.get('table')

  if (!customerId || !table) {
    return NextResponse.json({ error: 'Missing customerId or table' }, { status: 400 })
  }

  const order = await prisma.order.findFirst({
    where: {
      customerId: parseInt(customerId),
      table: table,
    },
    include: {
      customer: true,
      items: { include: { menu: true } },
    },
    orderBy: {
      createdAt: 'desc', // Ambil order terbaru jika ada beberapa
    },
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  return NextResponse.json(order)
}
