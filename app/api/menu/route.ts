
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      include: { category: true },
    })
    return NextResponse.json(menus)
  } catch (error) {
    console.error('GET /api/menu error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const menu = await prisma.menu.create({
      data: {
        name: body.name,
        price: body.price,
        image: body.image,
        categoryId: body.categoryId,
      },
    })
    return NextResponse.json(menu)
  } catch (error) {
    console.error('POST /api/menu error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
