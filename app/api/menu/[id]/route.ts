import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

type Params = {
  params: { id: string }
}

export async function PUT(req: Request, { params }: Params) {
  const id = parseInt(params.id)
  const body = await req.json()

  const updated = await prisma.menu.update({
    where: { id },
    data: body
  })

  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: Params) {
  const id = parseInt(params.id)

  try {
    // 1. delete relation menu option 
    await prisma.menuOption.deleteMany({
      where: { menuId: id }
    })

    // 2. delete relation order items
    await prisma.orderItem.deleteMany({
      where: { menuId: id }
    })

    // 3. delete menu 
    await prisma.menu.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Deleted' })
  } catch (error) {
    console.error('❌ Failed to delete menu:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    )
  }
}
