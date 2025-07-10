import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      include: {
        category: true,
        options: true, // 🔥 TAMBAHKAN INI!
      },
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

    if (!body.name || !body.price || !body.categoryId || !body.image) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const menu = await prisma.menu.create({
      data: {
        name: body.name,
        price: body.price,
        image: body.image,
        categoryId: body.categoryId,
        description: body.description,
        options: {
          create: body.options?.map((opt: any) => ({
            label: opt.label,
            isRequired: opt.isRequired || false,
            extraPrice: opt.extraPrice || 0
          }))
        }
      },
      include: { options: true }
    })

    return NextResponse.json(menu)
  } catch (error: any) {
    console.error('POST /api/menu error:', error?.message || error)
    return new NextResponse(error?.message || 'Internal Server Error', { status: 500 })
  }
}