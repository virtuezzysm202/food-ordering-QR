import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = {
  params: { slug: string }
}

export async function GET(req: Request, { params }: Params) {
  const customerId = parseInt(params.slug)

  if (isNaN(customerId)) {
    return NextResponse.json({ error: 'Invalid customerId' }, { status: 400 })
  }

  try {
    const order = await prisma.order.findFirst({
        where: {
          tableRelation: {
            slug: params.slug,
          },
          status: "pending",
        },
        include: {
          items: {
            include: {
              menu: true,
            },
          },
          customer: true,
          tableRelation: true, // ini yang tadinya error karena salah tulis 'table'
        },
      });

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (err) {
    console.error('Error finding order for customer:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}