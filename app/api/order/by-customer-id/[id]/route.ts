import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = {
  params: {
    id: string
  }
}

export async function GET(req: Request, { params }: Params) {
  const { id } = params
  const customerId = parseInt(id)

  if (isNaN(customerId)) {
    return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 })
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        customerId,
        status: 'pending', // atau sesuaikan dengan kebutuhan
      },
      include: {
        items: {
          include: {
            menu: true,
          },
        },
        customer: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
