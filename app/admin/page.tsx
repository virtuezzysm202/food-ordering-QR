'use client'

import { useEffect, useState } from 'react'

interface MenuItem {
  id: number
  name: string
  price: number
  category: { name: string }
  image?: string
}

type CategoryOption = 'Food' | 'Drink'
type Tab = 'menu' | 'report' | 'statistic'
type ViewMode = 'admin' | 'check'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('menu')
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [newMenu, setNewMenu] = useState({
    name: '',
    price: '',
    category: 'Food' as CategoryOption,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [tabView, setTabView] = useState<ViewMode>('admin')
  const [filterCategory, setFilterCategory] = useState<CategoryOption | 'All'>('All')

  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then(setMenus)
  }, [])

  const handleAddMenu = async () => {
    if (!newMenu.name || !newMenu.price || !newMenu.category) return

    // Ambil ID kategori
    const categoryRes = await fetch('/api/category')
    const categoryList = await categoryRes.json()
    const category = categoryList.find(
      (cat: any) => cat.name.toLowerCase() === newMenu.category.toLowerCase()
    )
    if (!category) return alert('Category not found.')

    // Upload image jika ada
    let imageFileName = 'placeholder.jpg'
    if (imageFile) {
      const formData = new FormData()
      formData.append('file', imageFile)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadRes.json()
      imageFileName = uploadData.fileName
    }

    // Simpan menu ke database
    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newMenu.name,
        price: parseInt(newMenu.price),
        categoryId: category.id,
        image: imageFileName,
      }),
    })

    const menu = await res.json()
    setMenus([...menus, menu])
    setNewMenu({ name: '', price: '', category: 'Food' })
    setImageFile(null)
    setPreviewUrl(null)
  }

  const formatCurrency = (amount: number, currency: 'IDR' | 'USD' | 'EUR' = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  }

  const filteredMenus = filterCategory === 'All'
    ? menus
    : menus.filter(menu => menu.category.name.toLowerCase() === filterCategory.toLowerCase())

  return (
    <main className="p-6 bg-white text-black min-h-screen">
      {/* Navbar View Switcher */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {tabView === 'admin' ? '👨‍🍳 Admin Panel' : '📋 Check Menu'}
        </h1>
        <button
          onClick={() => setTabView(tabView === 'admin' ? 'check' : 'admin')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {tabView === 'admin' ? 'Check Menu' : 'Back to Admin'}
        </button>
      </div>

      {tabView === 'admin' ? (
        <>
          {/* Admin Tabs */}
          <nav className="flex space-x-4 border-b pb-2 mb-6">
            {[
              { key: 'menu', label: 'Menu Configuration' },
              { key: 'report', label: 'Report' },
              { key: 'statistic', label: 'Statistic' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key as Tab)}
                className={`px-4 py-2 rounded ${
                  tab === key
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {tab === 'menu' && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">➕ Add Menu</h2>
                <div className="flex flex-wrap gap-4 items-end">
                  {/* Name */}
                  <div className="flex flex-col">
                    <label htmlFor="name" className="text-sm font-medium mb-1">Name:</label>
                    <input
                      id="name"
                      type="text"
                      value={newMenu.name}
                      onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                      className="border border-gray-300 p-2 rounded w-40"
                    />
                  </div>

                  {/* Price */}
                  <div className="flex flex-col">
                    <label htmlFor="price" className="text-sm font-medium mb-1">Price:</label>
                    <input
                      id="price"
                      type="number"
                      value={newMenu.price}
                      onChange={(e) => setNewMenu({ ...newMenu, price: e.target.value })}
                      className="border border-gray-300 p-2 rounded w-32"
                    />
                  </div>

                  {/* Category */}
                  <div className="flex flex-col">
                    <label htmlFor="category" className="text-sm font-medium mb-1">Category:</label>
                    <select
                      id="category"
                      value={newMenu.category}
                      onChange={(e) =>
                        setNewMenu({ ...newMenu, category: e.target.value as CategoryOption })
                      }
                      className="border border-gray-300 p-2 rounded w-36"
                    >
                      <option value="Food">Food</option>
                      <option value="Drink">Drink</option>
                    </select>
                  </div>

                  {/* Upload Image */}
                  <div className="flex flex-col">
                    <label htmlFor="image" className="text-sm font-medium mb-1">Photo:</label>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setImageFile(file)
                          setPreviewUrl(URL.createObjectURL(file))
                        }
                      }}
                      className="border border-gray-300 p-2 rounded w-48"
                    />
                  </div>

                  <button
                    onClick={handleAddMenu}
                    className="bg-black text-white px-4 py-2 rounded"
                  >
                    Add Menu
                  </button>
                </div>

                {/* Preview Image */}
                {previewUrl && (
                  <div className="mt-4">
                    <span className="block mb-1 text-sm text-gray-600">Preview:</span>
                    <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover border rounded" />
                  </div>
                )}
              </div>

              {/* Tabel Menu */}
              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Photo</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Price</th>
                    <th className="border p-2">Category</th>
                    <th className="border p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map((menu) => (
                    <tr key={menu.id}>
                      <td className="border p-2">
                        <img
                          src={`/uploads/${menu.image || 'placeholder.jpg'}`}
                          alt={menu.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="border p-2">{menu.name}</td>
                      <td className="border p-2">{formatCurrency(menu.price)}</td>
                      <td className="border p-2">{menu.category?.name}</td>
                      <td className="border p-2">
                        <button
                          onClick={() => {
                            fetch(`/api/menu/${menu.id}`, { method: 'DELETE' }).then(() => {
                              setMenus(menus.filter((m) => m.id !== menu.id))
                            })
                          }}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      ) : (
        <>
          {/* Check Menu View */}
          <div className="mb-4 flex items-center gap-4">
            <label htmlFor="filter-category" className="sr-only">Filter by Category</label>
            <select
              id="filter-category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="border p-2 rounded"
            >
              <option value="All">All</option>
              <option value="Food">Food</option>
              <option value="Drink">Drink</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenus.map(menu => (
              <div key={menu.id} className="border rounded-lg p-4 shadow hover:shadow-md transition">
                <img
                  src={`/uploads/${menu.image || 'placeholder.jpg'}`}
                  alt={menu.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="text-lg font-semibold">{menu.name}</h3>
                <p className="text-gray-600">{menu.category.name}</p>
                <p className="text-black font-bold mt-1">{formatCurrency(menu.price)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
