'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'


interface MenuItem {
id: number
name: string
price: number
category: { name: string }
image?: string
stock: number
description?: string
options?: MenuOption[]
}

interface OrderItem {
id: number
table: string
items: { id: number; quantity: number; menu: { name: string } }[]
status: string
createdAt: string
}

interface MenuOption {
label: string
isRequired: boolean
extraPrice: number
}

type CategoryOption = 'Food' | 'Drink'
type Tab = 'menu' | 'report' | 'statistic' | 'order'
type ViewMode = 'admin' | 'check'

export default function AdminPage() {
const [tab, setTab] = useState<Tab>('menu')
const [menus, setMenus] = useState<MenuItem[]>([])
const [newMenu, setNewMenu] = useState({
name: '',
price: '',
category: 'Food' as CategoryOption,
description: '',
stock: '',
})
const [imageFile, setImageFile] = useState<File | null>(null)
const [previewUrl, setPreviewUrl] = useState<string | null>(null)
const [tabView, setTabView] = useState<ViewMode>('admin')
const [filterCategory, setFilterCategory] = useState<CategoryOption | 'All'>('All')
const [orders, setOrders] = useState<OrderItem[]>([])
const [menuOptions, setMenuOptions] = useState<MenuOption[]>([])

const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null)


useEffect(() => {
fetch('/api/menu')
.then((res) => res.json())
.then(setMenus)
}, [])

useEffect(() => {
if (tab === 'order') {
fetch('/api/order')
.then(res => res.json())
.then(setOrders)
}
}, [tab])

const handleAddMenu = async () => {
if (!newMenu.name || !newMenu.price || !newMenu.category) return

const categoryRes = await fetch('/api/category')
const categoryList = await categoryRes.json()
const category = categoryList.find(
(cat: { name: string }) => cat.name.toLowerCase() === newMenu.category.toLowerCase()
)
if (!category) return alert('Category not found.')

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

const res = await fetch('/api/menu', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
name: newMenu.name,
price: parseInt(newMenu.price),
categoryId: category.id,
image: imageFileName,
description: newMenu.description,
options: menuOptions,
stock: parseInt(newMenu.stock),
}),
})

const menu = await res.json()
const refreshedMenus = await fetch('/api/menu').then(res => res.json())
setMenus(refreshedMenus)
setNewMenu({ name: '', price: '', category: 'Food', description: '', stock: '' })
setImageFile(null)
setPreviewUrl(null)
setMenuOptions([])
}

const formatCurrency = (amount: number, currency: 'IDR' | 'USD' | 'EUR' = 'IDR') => {
return new Intl.NumberFormat('id-ID', {
style: 'currency',
currency,
minimumFractionDigits: 0,
}).format(amount)
}

const filteredMenus = filterCategory === 'All'
? menus
: menus.filter(menu => menu.category.name.toLowerCase() === filterCategory.toLowerCase())

const addOptionField = () => {
setMenuOptions([...menuOptions, { label: '', isRequired: false, extraPrice: 0 }])
}

const updateOption = (
  index: number,
  field: 'label' | 'isRequired' | 'extraPrice',
  value: string | boolean | number
) => {
  const updated = [...menuOptions]
  const current = { ...updated[index] }

  if (field === 'extraPrice') {
    current[field] = Number(value)
  } else {
    current[field] = value as never
  }

  updated[index] = current
  setMenuOptions(updated)
}

const handleUpdateMenu = async () => {
  if (!editingMenu) return

  const res = await fetch(`/api/menu/${editingMenu.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: editingMenu.name,
      price: editingMenu.price,
      stock: editingMenu.stock,
      description: editingMenu.description,
    }),
  })

  if (res.ok) {
    const updated = await res.json()
    setMenus(menus.map((m) => (m.id === updated.id ? updated : m)))
    setEditingMenu(null)
  } else {
    alert('❌ Failed to update menu')
  }
}

const handleDeleteOrder = async (id: number) => {
  const confirmed = confirm('Are you sure you want to delete this order?')
  if (!confirmed) return

  try {
    const res = await fetch(`/api/order/${id}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      setOrders(orders.filter((order) => order.id !== id))
    } else {
      alert('❌ Failed to delete order')
    }
  } catch (err) {
    console.error('Delete error:', err)
    alert('❌ Error deleting order')
  }
}

const removeOption = (index: number) => {
const updated = [...menuOptions]
updated.splice(index, 1)
setMenuOptions(updated)
}




  return (
    <main className="p-6 bg-white text-black min-h-screen">
     <div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold">
    {tabView === 'admin' ? '👨‍🍳 Admin Panel' : '📋 Check Menu'}
  </h1>
  
  <div className="flex gap-3">
    <Link href="/admin/barcodesAdmin">
      <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
        Barcode Admin
      </button>
    </Link>

    <button
      onClick={() => setTabView(tabView === 'admin' ? 'check' : 'admin')}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      {tabView === 'admin' ? 'Check Menu' : 'Back to Admin'}
    </button>
  </div>
</div>

      

      {tabView === 'admin' ? (
        <>
          <nav className="flex space-x-4 border-b pb-2 mb-6">
            {[{ key: 'menu', label: 'Menu Configuration' }, { key: 'report', label: 'Report' }, { key: 'statistic', label: 'Statistic' }, { key: 'order', label: 'Order' }].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key as Tab)}
                className={`px-4 py-2 rounded ${tab === key ? 'bg-black text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
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

                  <div className="flex flex-col">
                    <label htmlFor="category" className="text-sm font-medium mb-1">Category:</label>
                    <select
                      id="category"
                      value={newMenu.category}
                      onChange={(e) => setNewMenu({ ...newMenu, category: e.target.value as CategoryOption })}
                      className="border border-gray-300 p-2 rounded w-36"
                    >
                      <option value="Food">Food</option>
                      <option value="Drink">Drink</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="description" className="text-sm font-medium mb-1">Description:</label>
                    <textarea
                      id="description"
                      value={newMenu.description}
                      onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
                      className="border border-gray-300 p-2 rounded w-64"
                    />
                  </div>

                  <div className="flex flex-col">
                      <label htmlFor="stock" className="text-sm font-medium mb-1">Stock:</label>
                          <input
                            id="stock"
                            type="number"
                            value={newMenu.stock}
                              onChange={(e) => setNewMenu({ ...newMenu, stock: e.target.value })}
                              className="border border-gray-300 p-2 rounded w-24"
                            />
                    </div>

                  <div className="mt-4">
  <h3 className="font-semibold mb-2">Options</h3>
  {menuOptions.map((opt, idx) => (
    <div key={idx} className="flex items-center gap-2 mb-2">
      <input
        type="text"
        placeholder="Label"
        value={opt.label}
        onChange={(e) => updateOption(idx, 'label', e.target.value)}
        className="border p-2 rounded w-40"
      />
  <input
  type="number"
  placeholder="Extra Price"
  value={opt.extraPrice === 0 ? '' : opt.extraPrice}
  onChange={(e) => {
    const raw = e.target.value
    const value = raw === '' ? 0 : parseInt(raw)
    updateOption(idx, 'extraPrice', value)
  }}
  className="border p-2 rounded w-32"
/>

      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={opt.isRequired}
          onChange={(e) => updateOption(idx, 'isRequired', e.target.checked)}
        /> Required
      </label>
      <button
        onClick={() => removeOption(idx)}
        className="text-red-500 hover:underline"
      >Remove</button>
    </div>
  ))}
  <button
    onClick={addOptionField}
    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
  >Add Option</button>
</div>



{editingMenu && (
  <div className="mt-8 p-4 bg-yellow-50 border rounded">
    <h3 className="text-lg font-bold mb-4">✏️ Edit Menu: {editingMenu.name}</h3>
    <div className="flex flex-wrap gap-4 items-end">
      <input
        type="text"
        value={editingMenu.name}
        onChange={(e) => setEditingMenu({ ...editingMenu, name: e.target.value })}
        placeholder="Name"
        className="border p-2 rounded w-40"
      />
      <input
        type="number"
        value={editingMenu.price}
        onChange={(e) => setEditingMenu({ ...editingMenu, price: parseInt(e.target.value) })}
        placeholder="Price"
        className="border p-2 rounded w-32"
      />
      <input
        type="number"
        value={editingMenu.stock ?? 0}
        onChange={(e) => setEditingMenu({ ...editingMenu, stock: parseInt(e.target.value) })}
        placeholder="Stock"
        className="border p-2 rounded w-32"
      />
      <textarea
        value={editingMenu.description || ''}
        onChange={(e) => setEditingMenu({ ...editingMenu, description: e.target.value })}
        placeholder="Description"
        className="border p-2 rounded w-64"
      />
      <button
        onClick={handleUpdateMenu}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        ✅ Save
      </button>
      <button
        onClick={() => setEditingMenu(null)}
        className="bg-gray-300 text-black px-4 py-2 rounded"
      >
        ❌ Cancel
      </button>
    </div>
  </div>
)}



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

                {previewUrl && (
                  <div className="mt-4">
                    <span className="block mb-1 text-sm text-gray-600">Preview:</span>
                    <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover border rounded" />
                  </div>
                )}
              </div>

              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Photo</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Price</th>
                    <th className="border p-2">Category</th>
                    <th className="border p-2">Stock</th>
                    <th className="border p-2">Description</th>
                    <th className="border p-2">Options</th>
                    <th className="border p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
  {menus.map((menu) => (
    <tr key={menu.id}>
      <td className="border p-2">
        <img src={`/uploads/${menu.image || 'placeholder.jpg'}`} alt={menu.name} className="w-16 h-16 object-cover rounded" />
      </td>
      <td className="border p-2">{menu.name}</td>
      <td className="border p-2">{formatCurrency(menu.price)}</td>
      <td className="border p-2">{menu.category?.name}</td>
      <td className="border p-2">{menu.stock ?? '-'}</td> 
      <td className="border p-2">{menu.description || '-'}</td>
      <td className="border p-2">
        {Array.isArray(menu.options) && menu.options.length > 0
          ? menu.options.map((opt) => opt.label).join(', ')
          : '-'}
      </td>
      <td className="border p-2 space-x-3">
  <button
    onClick={() => setEditingMenu(menu)}
    className="text-blue-600 hover:underline"
  >
    Edit
  </button>
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

{tab === 'order' && (
  <div>
    <h2 className="text-xl font-semibold mb-4">📦 Customer Orders</h2>
    <table className="w-full text-sm border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2">Table</th>
          <th className="border p-2">Items</th>
          <th className="border p-2">Status</th>
          <th className="border p-2">Time</th>
          <th className="border p-2">Action</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order: any) => (
          <tr key={order.id}>
            <td className="border p-2">{order.table}</td>
            <td className="border p-2">
              <ul className="list-disc ml-4">
                {order.items.map((item: any) => (
                  <li key={item.id}>
                    {item.menu.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </td>
            <td className="border p-2">{order.status}</td>
            <td className="border p-2">{new Date(order.createdAt).toLocaleString()}</td>
            <td className="border p-2 text-center">
              <button
                onClick={() => handleDeleteOrder(order.id)}
                className="text-red-600 hover:text-red-800"
                title="Delete Order"
              >
                🗑️
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

        </>
      ) : (
        <>
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
      <p className="text-sm text-gray-700 mt-1">Stock: {menu.stock ?? '-'}</p> {/* Tambahkan ini */}
      {Array.isArray(menu.options) && menu.options.length > 0 && (
        <div className="text-sm text-gray-600 mt-1">
          <span className="font-medium">Options:</span> {menu.options.map(opt => opt.label).join(', ')}
        </div>
      )}
    </div>
  ))}
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
      {menu.description && (
        <p className="text-sm text-gray-700 mt-1">{menu.description}</p>
      )}
      {menu.options && menu.options.length > 0 && (
        <ul className="mt-2 text-sm list-disc list-inside text-gray-800">
          {menu.options.map((opt, idx) => (
            <li key={idx}>
              {opt.label}
              {opt.isRequired && ' (required)'}
              {opt.extraPrice > 0 && ` (+${formatCurrency(opt.extraPrice)})`}
            </li>
          ))}
        </ul>
      )}
    </div>
  ))}
</div>

        </>
      )}
    </main>
  )
}
