// app/api/order/by-table/[slug]/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug

  const table = await prisma.table.findUnique({
    where: { slug }
  });
  
  if (!table) {
    return NextResponse.json({ error: 'Table not found' }, { status: 404 });
  }

  
  
  const order = await prisma.order.findFirst({
    where: {
      tableId: table.id,
    },
    include: {
      items: {
        include: {
          menu: true,
          // 'options' tidak ada di OrderItem, jadi jangan disertakan kecuali kamu menambahkan relasi ini
        },
      },
      customer: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

