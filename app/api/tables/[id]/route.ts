import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    await prisma.table.delete({ where: { id } })
    return NextResponse.json({ message: 'Table deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete', detail: (error as any).message }, { status: 500 })
  }
}
