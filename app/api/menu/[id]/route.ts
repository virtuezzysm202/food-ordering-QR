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

  await prisma.menu.delete({
    where: { id }
  })

  return NextResponse.json({ message: 'Deleted' })
}
