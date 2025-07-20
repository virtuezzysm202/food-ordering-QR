import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, context: { params: { id: string } }) {
  const { params } = context
  const customerId = parseInt(params?.id || "")
  const url = new URL(req.url)
  const tableSlug = url.searchParams.get("table")

  if (isNaN(customerId) || !tableSlug) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: { include: { menu: true } }
          }
        }
      }
    })

    if (!customer || customer.orders.length === 0) {
      return NextResponse.json({ error: 'Customer or order not found' }, { status: 404 })
    }

    const order = customer.orders[0]

    // ❗ Filter berdasarkan tableSlug
    if (order.table !== tableSlug) {
      return NextResponse.json({ error: 'Order does not belong to this table' }, { status: 403 })
    }

    return NextResponse.json({
      id: customer.id,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        menu: {
          id: item.menu.id,
          name: item.menu.name,
          price: item.menu.price,
        },
      })),
      orderId: order.id,
      table: order.table,
      status: order.status,
      createdAt: order.createdAt,
    })
  } catch (error) {
    console.error('Error fetching customer order:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
