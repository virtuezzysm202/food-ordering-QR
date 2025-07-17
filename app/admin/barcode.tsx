'use client'

import { QRCodeSVG } from 'qrcode.react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function BarcodePage() {
  const { data: tables, error } = useSWR('/api/tables', fetcher)

  if (error) return <div>Failed build table</div>
  if (!tables) return <div>Loading..</div>

  return (
    <div>
      {tables.map((table: any) => (
        <div key={table.id}>
          <h2>Meja {table.name}</h2>
          <QRCodeSVG value={`http://localhost:3000/customer/${table.slug}`} />
        </div>
      ))}
    </div>
  )
}
