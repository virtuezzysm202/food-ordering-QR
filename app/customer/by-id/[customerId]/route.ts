import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = {
params: { customerId: string }
}

export async function GET(req: Request, { params }: Params) {
const customerId = parseInt(params.customerId) // ✅ convert ke number

try {
const order = await prisma.order.findFirst({
where: { customerId },
orderBy: { createdAt: 'desc' },
include: {
items: {
include: { menu: true }
},
customer: true
// tambahkan table: true kalau ada relasi table di model
}
})

if (!order) {
return NextResponse.json({ message: 'Order not found' }, { status: 404 })
}

return NextResponse.json(order)
} catch (err) {
console.error('Error finding order for customer:', err)
return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
}
}