'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface MenuItem {
  id: number
  name: string
  price: number
}

interface OrderItem {
  id: number
  quantity: number
  price: number
  menu: MenuItem
  options?: { label: string; extraPrice: number }[]
}

interface Order {
  id: number
  table: string
  status: string
  total: number
  createdAt: string
  items: OrderItem[]
  customer: {
    name: string
    phone?: string
  }
}

export default function ReceiptPage() {
  const searchParams = useSearchParams()
  const customerId = searchParams?.get('customerId')
  const table = searchParams?.get('table')

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!customerId || !table) return

      try {
        const res = await fetch(`/api/receipt?customerId=${customerId}&table=${table}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch receipt')

        setOrder(data)
      } catch (error) {
        console.error('Error fetching receipt:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [customerId, table])

  if (!customerId || !table) return <div className="p-4 text-red-600">Missing customerId or table</div>
  if (loading) return <div className="p-4">Loading...</div>
  if (!order) return <div className="p-4 text-gray-500">Order not found</div>

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Receipt</h1>
      <div className="mb-2">Table: <strong>{order.table}</strong></div>
      <div className="mb-2">Customer: <strong>{order.customer?.name}</strong></div>
      <div className="mb-4 text-sm text-gray-500">
        Order Time: {new Date(order.createdAt).toLocaleString()}
      </div>

      {order.items?.map((item) => (
        <div key={item.id} className="border-b py-2">
          <div className="font-semibold">{item.menu?.name}</div>
          <div>Qty: {item.quantity}</div>
          <div>
            Price: Rp{item.price?.toLocaleString?.() ?? 0}
          </div>
          {item.options?.map((opt, idx) => (
            <div key={idx} className="ml-4 text-sm text-gray-600">
              + {opt.label} (Rp{opt.extraPrice?.toLocaleString?.() ?? 0})
            </div>
          ))}
        </div>
      ))}

      <div className="mt-4 font-bold text-xl">
        Total: Rp{order.total?.toLocaleString?.() ?? 0}
      </div>
    </div>
  )
}
