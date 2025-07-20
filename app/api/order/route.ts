import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/order
export async function POST(req: Request) {
  try {
    const { table, items, customer } = await req.json()

    const email = customer?.email || `guest-${Date.now()}@example.com`

    const createdCustomer = await prisma.customer.upsert({
      where: { email },
      update: { ...customer, email },
      create: { ...customer, email },
    })

    const order = await prisma.order.create({
      data: {
        table,
        customerId: createdCustomer.id,
        items: {
          create: items.map((item: any) => ({
            menuId: item.menuId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: { include: { menu: true } },
        customer: true
      }
    })

    console.log('✅ Order created:', order)

    // Kirim response lengkap termasuk order dan customer
    return NextResponse.json(order)
  } catch (error) {
    console.error("❌ Error creating order:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// GET /api/order
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: {
          include: { menu: true }
        }
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("❌ Error fetching orders:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
