import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { slug: string } }) {
const { slug } = params

const table = await prisma.table.findUnique({
where: { slug },
include: {
orders: {
include: {
items: {
include: {
menu: true
}
},
customer: true
},
orderBy: { createdAt: 'desc' },
take: 1
}
}
})

if (!table) {
return NextResponse.json({ error: 'Table not found' }, { status: 404 })
}

return NextResponse.json(table)
}