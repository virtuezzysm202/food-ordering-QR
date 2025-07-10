'use client'

import { useEffect, useRef, useState } from 'react'

interface MenuOption {
  label: string
  isRequired: boolean
  extraPrice: number
}

interface MenuItem {
  id: number
  name: string
  price: number
  image?: string
  description?: string
  category: { name: string }
  options?: MenuOption[]
}

type Category = 'All' | 'Food' | 'Drink'

interface CartItem {
  menu: MenuItem
  quantity: number
  selectedOptions: MenuOption[]
}

export default function CustomerPage() {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [filterCategory, setFilterCategory] = useState<Category>('All')
  const [cart, setCart] = useState<CartItem[]>([])
  const cartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then(setMenus)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount)
  }

  const filteredMenus = filterCategory === 'All'
    ? menus
    : menus.filter((menu) => menu.category.name.toLowerCase() === filterCategory.toLowerCase())

  const handleOptionSelect = (menuId: number, option: MenuOption, checked: boolean) => {
    setCart(prev => {
      const itemIndex = prev.findIndex(i => i.menu.id === menuId)
      if (itemIndex === -1) {
        return [...prev, { menu: menus.find(m => m.id === menuId)!, quantity: 1, selectedOptions: checked ? [option] : [] }]
      }

      const item = { ...prev[itemIndex] }
      item.selectedOptions = checked
        ? [...item.selectedOptions, option]
        : item.selectedOptions.filter(o => o.label !== option.label)

      const newCart = [...prev]
      newCart[itemIndex] = item
      return newCart
    })
  }

  const addToCart = (menu: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.menu.id === menu.id)
      if (existing) {
        return prev.map(item =>
          item.menu.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      } else {
        return [...prev, { menu, quantity: 1, selectedOptions: [] }]
      }
    })
  }

  const removeFromCart = (menuId: number) => {
    setCart(prev => prev.filter(item => item.menu.id !== menuId))
  }

  const getTotal = () => {
    return cart.reduce((acc, item) => {
      const optionTotal = item.selectedOptions.reduce((sum, opt) => sum + opt.extraPrice, 0)
      return acc + (item.menu.price + optionTotal) * item.quantity
    }, 0)
  }

  const scrollToCart = () => {
    cartRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      return alert('Cart is empty.')
    }

    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'A1',
        customer: {
          name: 'Guest',
          email: `guest-${Date.now()}@dummy.com`
        },
        items: cart.map(item => ({
          menuId: item.menu.id,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions
        }))
      })
    })

    if (res.ok) {
      alert('✅ Pesanan berhasil dikirim!')
      setCart([])
    } else {
      alert('❌ Gagal melakukan checkout.')
    }
  }

  return (
    <main className="bg-white text-black min-h-screen">
      <nav className="flex justify-between items-center px-6 py-4 shadow sticky top-0 bg-white z-10">
        <h1 className="text-2xl font-bold">📖 Menu</h1>
        <div className="flex items-center gap-4">
          <label htmlFor="filter" className="text-sm font-medium">Filter:</label>
          <select
            id="filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as Category)}
            className="border p-2 rounded"
          >
            <option value="All">All</option>
            <option value="Food">Food</option>
            <option value="Drink">Drink</option>
          </select>

          <button
            onClick={scrollToCart}
            className="relative bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            🛒 Cart ({cart.length})
          </button>
        </div>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {filteredMenus.map((menu) => (
          <div key={menu.id} className="border rounded-lg p-4 shadow hover:shadow-md transition">
            <img
              src={`/uploads/${menu.image || 'placeholder.jpg'}`}
              alt={menu.name}
              className="w-full h-40 object-cover rounded mb-2"
            />
            <h3 className="text-lg font-semibold">{menu.name}</h3>
            <p className="text-gray-600">{menu.category.name}</p>
            <p className="text-black font-bold mt-1">{formatCurrency(menu.price)}</p>
            {menu.description && <p className="text-sm text-gray-500 mt-1">{menu.description}</p>}
            {menu.options && menu.options.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Options:</p>
                {menu.options.map((opt, i) => (
                  <label key={i} className="block text-sm">
                    <input
                      type="checkbox"
                      className="mr-2"
                      onChange={(e) => handleOptionSelect(menu.id, opt, e.target.checked)}
                    />
                    {opt.label} {opt.extraPrice > 0 && `(+${formatCurrency(opt.extraPrice)})`}
                  </label>
                ))}
              </div>
            )}
            <button
              onClick={() => addToCart(menu)}
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              + Add to Cart
            </button>
          </div>
        ))}
      </div>

      <div ref={cartRef} className="px-6 pt-6 border-t bg-gray-50 pb-12">
        <h2 className="text-xl font-bold mb-4">🛒 Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">Cart is empty</p>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.menu.id} className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{item.menu.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {formatCurrency(item.menu.price)}
                    </p>
                    {item.selectedOptions.length > 0 && (
                      <ul className="text-sm text-gray-600 list-disc ml-5">
                        {item.selectedOptions.map((opt, i) => (
                          <li key={i}>{opt.label} {opt.extraPrice > 0 && `(+${formatCurrency(opt.extraPrice)})`}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold">
                      {formatCurrency((item.menu.price + item.selectedOptions.reduce((s, o) => s + o.extraPrice, 0)) * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.menu.id)}
                      className="text-red-600 hover:underline"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between mt-4 text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(getTotal())}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              ✅ Checkout
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
