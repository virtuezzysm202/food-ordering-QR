'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'

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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">

        <div className="mb-6">
          <Link href="/admin" passHref>
            <button
              className="
                bg-white 
                border 
                border-gray-300 
                text-gray-700 
                px-5 
                py-2 
                rounded-md 
                shadow-sm
                hover:bg-gray-100 
                hover:shadow-md
                transition 
                duration-200
                flex 
                items-center 
                gap-2
                font-semibold
                "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Admin
            </button>
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-gray-900">QR Manage Admin</h1>

        <div className="mb-8 border border-gray-200 p-6 rounded-lg bg-gray-50 shadow-sm">
          <input
            className="border border-gray-300 p-3 mr-4 rounded-md w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            placeholder="Table Name"
            title="Table Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border border-gray-300 p-3 mr-4 rounded-md w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            placeholder="Slug (example: table-1)"
            title="Slug Table"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 transition duration-200 shadow"
            onClick={handleCreateTable}
          >
            Create QR
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {tables.map((table) => (
            <div
              key={table.id}
              className="border border-gray-200 p-6 rounded-lg shadow-sm bg-white text-center flex flex-col items-center"
            >
              <p className="font-semibold text-lg mb-3 text-gray-800">{table.name}</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:3001/customer/${table.slug}`}
                alt={`QR ${table.name}`}
                className="mx-auto mb-3"
              />
              <a
                href={`/customer/${table.slug}`}
                className="text-blue-600 underline hover:text-blue-800 mb-3"
                target="_blank"
                rel="noopener noreferrer"
              >
                Link Customer
              </a>
              <button
                onClick={() => handleDelete(table.id)}
                className="text-red-600 hover:underline hover:text-red-800 font-semibold"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
