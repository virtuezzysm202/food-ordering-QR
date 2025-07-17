'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

type Table = {
  id: number
  name: string
  slug: string
}

export default function AdminBarcodePage() {
  const [tables, setTables] = useState<Table[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const fetchTables = async () => {
    const res = await fetch('/api/tables')
    const data = await res.json()
    setTables(data)
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const handleCreateTable = async () => {
    if (!name || !slug) {
      alert('name and slug are required')
      return
    }

    try {
      await axios.post('/api/tables', { name, slug })
      setName('')
      setSlug('')
      fetchTables()
    } catch (error) {
      alert('Failed build table: ' + (error as any)?.response?.data?.error || 'Unknown error')
    }
  }

  const handleDelete = async (id: number) => {
    await axios.delete(`/api/tables/${id}`)
    fetchTables()
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">QR Manage Admin</h1>

      <div className="mb-6 border p-4 rounded-lg bg-gray-50">
        <input
          className="border p-2 mr-2 w-1/3"
          placeholder="Table Name"
          title="Table Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 mr-2 w-1/3"
          placeholder="Slug (example: table-1)"
          title="Slug Table"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleCreateTable}
        >
          Create QR
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {tables.map((table) => (
          <div key={table.id} className="border p-4 rounded shadow bg-white text-center">
            <p className="font-semibold mb-2">{table.name}</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:3001/customer/${table.slug}`}
              alt={`QR ${table.name}`}
              className="mx-auto"
            />
            <a
              href={`/customer/${table.slug}`}
              className="text-blue-600 block mt-2 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Link Customer
            </a>
            <button
              onClick={() => handleDelete(table.id)}
              className="mt-2 text-red-600 hover:underline"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
