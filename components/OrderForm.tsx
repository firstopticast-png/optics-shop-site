'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Save, Printer, MessageCircle, Plus, Trash2 } from 'lucide-react'
import jsPDF from 'jspdf'

interface OrderItem {
  id: string
  name: string
  quantity: string
  price: string
}

interface PrescriptionData {
  od_sph: string
  od_cyl: string
  od_ax: string
  os_sph: string
  os_cyl: string
  os_ax: string
  pd: string
  add: string
}

interface Client {
  id: string
  name: string
  phone: string
  email: string
  address: string
  birthDate: string
  registrationDate: string
  totalOrders: number
  totalSpent: number
  lastVisit: string
  notes: string
}

export default function OrderForm() {
  const [orderNumber, setOrderNumber] = useState(`2025-${String(Date.now()).slice(-3)}`)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0])
  const [readyDate, setReadyDate] = useState('')
  
  const [prescription, setPrescription] = useState<PrescriptionData>({
    od_sph: '', od_cyl: '', od_ax: '',
    os_sph: '', os_cyl: '', os_ax: '',
    pd: '', add: ''
  })
  
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', name: '', quantity: "", price: "" }
  ])
  
  const [paid, setPaid] = useState("")
  
  // Autocomplete states
  const [clients, setClients] = useState<Client[]>([])
  const [nameSuggestions, setNameSuggestions] = useState<Client[]>([])
  const [phoneSuggestions, setPhoneSuggestions] = useState<Client[]>([])
  const [showNameSuggestions, setShowNameSuggestions] = useState(false)
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)

  // Load clients from localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('optics-sonata-clients')
    if (savedClients) {
      setClients(JSON.parse(savedClients))
    }
  }, [])

  // Autocomplete functions
  const searchClients = (query: string, field: 'name' | 'phone') => {
    if (!query || query.length < 2) return []
    
    return clients.filter(client => {
      const searchValue = field === 'name' ? client.name.toLowerCase() : client.phone
      return searchValue.includes(query.toLowerCase())
    }).slice(0, 5) // Limit to 5 suggestions
  }

  const handleNameChange = (value: string) => {
    setCustomerName(value)
    const suggestions = searchClients(value, 'name')
    setNameSuggestions(suggestions)
    setShowNameSuggestions(suggestions.length > 0)
    
    // If exact match found, auto-fill phone
    const exactMatch = suggestions.find(client => 
      client.name.toLowerCase() === value.toLowerCase()
    )
    if (exactMatch) {
      setCustomerPhone(exactMatch.phone)
    }
  }

  const handlePhoneChange = (value: string) => {
    setCustomerPhone(value)
    const suggestions = searchClients(value, 'phone')
    setPhoneSuggestions(suggestions)
    setShowPhoneSuggestions(suggestions.length > 0)
    
    // If exact match found, auto-fill name
    const exactMatch = suggestions.find(client => 
      client.phone === value
    )
    if (exactMatch) {
      setCustomerName(exactMatch.name)
    }
  }

  const selectSuggestion = (client: Client) => {
    setCustomerName(client.name)
    setCustomerPhone(client.phone)
    setNameSuggestions([])
    setPhoneSuggestions([])
    setShowNameSuggestions(false)
    setShowPhoneSuggestions(false)
  }

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', quantity: "", price: "" }])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof OrderItem, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const total = items.reduce((sum, item) => sum + (parseFloat(item.price || "0") * parseFloat(item.quantity || "0")), 0)
  const debt = total - parseFloat(paid || "0")

  const handleSave = () => {
    // Validate required fields
    if (!customerName.trim()) {
      alert('Пожалуйста, укажите ФИО клиента')
      return
    }
    
    if (!customerPhone.trim()) {
      alert('Пожалуйста, укажите номер телефона клиента')
      return
    }
    
    const orderData = {
      id: Date.now().toString(),
      orderNumber,
      customerName,
      customerPhone,
      orderDate,
      readyDate,
      prescription,
      items,
      total,
      paid: parseFloat(paid || "0"),
      debt: total - parseFloat(paid || "0"),
      createdAt: new Date().toISOString(),
      status: 'active'
    }

    // Get existing orders from localStorage
    const existingOrders = JSON.parse(localStorage.getItem('optics-sonata-orders') || '[]')
    
    // Add new order
    const updatedOrders = [...existingOrders, orderData]
    
    // Save to localStorage
    localStorage.setItem('optics-sonata-orders', JSON.stringify(updatedOrders))
    
    // Add or update client in database
    const existingClient = clients.find(client => 
      client.name.toLowerCase() === customerName.toLowerCase() || 
      client.phone === customerPhone
    )

    if (existingClient) {
      // Update existing client
      const updatedClient = {
        ...existingClient,
        totalOrders: existingClient.totalOrders + 1,
        totalSpent: existingClient.totalSpent + total,
        lastVisit: orderDate
      }
      
      const updatedClients = clients.map(client => 
        client.id === existingClient.id ? updatedClient : client
      )
      setClients(updatedClients)
      localStorage.setItem('optics-sonata-clients', JSON.stringify(updatedClients))
    } else {
      // Add new client
      const newClient: Client = {
        id: Date.now().toString(),
        name: customerName,
        phone: customerPhone,
        email: '',
        address: '',
        birthDate: '',
        registrationDate: orderDate,
        totalOrders: 1,
        totalSpent: total,
        lastVisit: orderDate,
        notes: ''
      }
      
      const updatedClients = [...clients, newClient]
      setClients(updatedClients)
      localStorage.setItem('optics-sonata-clients', JSON.stringify(updatedClients))
    }
    
    // Show success message
    alert(`Заказ №${orderNumber} успешно сохранен!`)
    
    // Reset form
    setOrderNumber(`2025-${String(Date.now()).slice(-3)}`)
    setCustomerName('')
    setCustomerPhone('')
    setOrderDate(new Date().toISOString().split('T')[0])
    setReadyDate('')
    setPrescription({
      od_sph: '', od_cyl: '', od_ax: '',
      os_sph: '', os_cyl: '', os_ax: '',
      pd: '', add: ''
    })
    setItems([{ id: '1', name: '', quantity: "", price: "" }])
    setPaid("")
    
    // Clear suggestions
    setNameSuggestions([])
    setPhoneSuggestions([])
    setShowNameSuggestions(false)
    setShowPhoneSuggestions(false)
  }

  const handlePrint = () => {
    // Create a temporary HTML element for PDF generation
    const printContent = document.createElement('div')
    printContent.style.cssText = `
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      font-family: Arial, sans-serif;
      background: white;
      color: black;
      line-height: 1.4;
    `
    
    printContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #1f2937;">ОПТИКА СОНАТА</h1>
        <div style="font-size: 12px; color: #6b7280;">
          <div>WhatsApp: +7 700 743 9775</div>
          <div>Instagram: sonata.astana</div>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px;">
        <div></div>
        <div style="text-align: right;">
          <div style="font-weight: bold;">Заказ № ${orderNumber}</div>
          <div>Дата: ${new Date().toLocaleDateString('ru-RU')}</div>
        </div>
      </div>
      
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">ИНФОРМАЦИЯ О КЛИЕНТЕ</h2>
        <div style="font-size: 14px; line-height: 1.6;">
          <div><strong>ФИО:</strong> ${customerName || 'Не указано'}</div>
          <div><strong>Телефон:</strong> ${customerPhone || 'Не указано'}</div>
          <div><strong>Дата заказа:</strong> ${orderDate}</div>
          ${readyDate ? `<div><strong>Готовность:</strong> ${readyDate}</div>` : ''}
        </div>
      </div>
      
      ${prescription.od_sph || prescription.os_sph ? `
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">РЕЦЕПТ</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Глаз</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Sph</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Cyl</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Ax</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; font-weight: bold;">OD</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${prescription.od_sph || '-'}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${prescription.od_cyl || '-'}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${prescription.od_ax || '-'}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; font-weight: bold;">OS</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${prescription.os_sph || '-'}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${prescription.os_cyl || '-'}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${prescription.os_ax || '-'}</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top: 10px; font-size: 14px;">
          <span style="margin-right: 30px;"><strong>Pd:</strong> ${prescription.pd || '-'}</span>
          <span><strong>Add:</strong> ${prescription.add || '-'}</span>
        </div>
      </div>
      ` : ''}
      
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">ТОВАРЫ</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">№</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Наименование</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Кол-во</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Цена</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Итого</th>
            </tr>
          </thead>
          <tbody>
            ${items.filter(item => item.name).map((item, index) => `
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px;">${item.name}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${parseFloat(item.price || '0').toLocaleString()} ₸</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;">${(parseFloat(item.price || '0') * parseFloat(item.quantity || '0')).toLocaleString()} ₸</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div style="margin-bottom: 30px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
          Общая сумма: ${total.toLocaleString()} ₸
        </div>
        ${parseFloat(paid || '0') > 0 ? `
          <div style="font-size: 14px; margin-bottom: 5px;">
            Оплачено: ${parseFloat(paid || '0').toLocaleString()} ₸
          </div>
        ` : ''}
        ${debt > 0 ? `
          <div style="font-size: 14px; color: #dc2626; font-weight: bold;">
            Долг: ${debt.toLocaleString()} ₸
          </div>
        ` : ''}
      </div>
      
      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #d1d5db; font-size: 12px; color: #6b7280; text-align: center;">
        <div>Астана, Сыганак 32</div>
        <div>WhatsApp: +7 700 743 9770 | Instagram: sonata.astana</div>
      </div>
    `
    
    // Temporarily add to DOM
    document.body.appendChild(printContent)
    
    // Use browser's print functionality
    window.print()
    
    // Clean up
    document.body.removeChild(printContent)
  }

  const handleWhatsApp = () => {
    if (!customerPhone) {
      alert('Пожалуйста, укажите номер телефона клиента')
      return
    }
    
    // Format phone number (remove spaces, dashes, parentheses)
    const cleanPhone = customerPhone.replace(/[\s\-\(\)]/g, '')
    
    // Create WhatsApp message
    let message = `Здравствуйте! Ваш заказ №${orderNumber} готов.\n\n`
    message += `📋 Детали заказа:\n`
    message += `• Дата заказа: ${orderDate}\n`
    if (readyDate) {
      message += `• Готовность: ${readyDate}\n`
    }
    message += `• Общая сумма: ${total.toLocaleString()} ₸\n`
    
    if (parseFloat(paid || '0') > 0) {
      message += `• Оплачено: ${parseFloat(paid || '0').toLocaleString()} ₸\n`
    }
    
    if (debt > 0) {
      message += `• Долг: ${debt.toLocaleString()} ₸\n`
    }
    
    // Add prescription if available
    if (prescription.od_sph || prescription.os_sph) {
      message += `\n👁 Рецепт:\n`
      message += `OD: ${prescription.od_sph || '-'}/${prescription.od_cyl || '-'}×${prescription.od_ax || '-'}\n`
      message += `OS: ${prescription.os_sph || '-'}/${prescription.os_cyl || '-'}×${prescription.os_ax || '-'}\n`
      message += `Pd: ${prescription.pd || '-'}, Add: ${prescription.add || '-'}\n`
    }
    
    // Add items
    if (items.some(item => item.name)) {
      message += `\n🛍 Товары:\n`
      items.forEach((item, index) => {
        if (item.name) {
          message += `${index + 1}. ${item.name} - ${item.quantity} шт. - ${parseFloat(item.price || '0').toLocaleString()} ₸\n`
        }
      })
    }
    
    message += `\nСпасибо за ваш заказ! 🙏`
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message)
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank')
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">ОПТИКА СОНАТА</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Новый заказ</p>
          </div>
          <div className="text-right">
            <Label className="text-sm text-gray-500">Дата</Label>
            <p className="font-medium">{new Date().toLocaleDateString('ru-RU')}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="orderNumber">Заказ №</Label>
            <Input
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="font-mono"
            />
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-4">
          <div className="relative">
            <Label htmlFor="customerName">ФИО</Label>
            <Input
              ref={nameInputRef}
              id="customerName"
              value={customerName}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => {
                if (nameSuggestions.length > 0) setShowNameSuggestions(true)
              }}
              onBlur={() => {
                setTimeout(() => setShowNameSuggestions(false), 200)
              }}
              placeholder="Введите ФИО клиента"
            />
            {showNameSuggestions && nameSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {nameSuggestions.map((client) => (
                  <div
                    key={client.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => selectSuggestion(client)}
                  >
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.phone}</div>
                    <div className="text-xs text-gray-400">Заказов: {client.totalOrders}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <Label htmlFor="customerPhone">Тел.</Label>
            <Input
              ref={phoneInputRef}
              id="customerPhone"
              value={customerPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onFocus={() => {
                if (phoneSuggestions.length > 0) setShowPhoneSuggestions(true)
              }}
              onBlur={() => {
                setTimeout(() => setShowPhoneSuggestions(false), 200)
              }}
              placeholder="+7 700 000 0000"
            />
            {showPhoneSuggestions && phoneSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {phoneSuggestions.map((client) => (
                  <div
                    key={client.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => selectSuggestion(client)}
                  >
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.phone}</div>
                    <div className="text-xs text-gray-400">Заказов: {client.totalOrders}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dates - УДАЛЕНО ПОЛЕ "ПРИНЯТ" */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="orderDate">Дата заказа</Label>
            <Input
              id="orderDate"
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="readyDate">Готовность</Label>
            <Input
              id="readyDate"
              type="date"
              value={readyDate}
              onChange={(e) => setReadyDate(e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Prescription */}
        <div className="space-y-4">
          <h3 className="font-semibold">Рецепт</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div></div>
            <div className="font-medium">Sph</div>
            <div className="font-medium">Cyl</div>
            <div className="font-medium">Ax</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="font-medium flex items-center">OD</div>
            <Input
              value={prescription.od_sph}
              onChange={(e) => setPrescription({...prescription, od_sph: e.target.value})}
              placeholder="0"
            />
            <Input
              value={prescription.od_cyl}
              onChange={(e) => setPrescription({...prescription, od_cyl: e.target.value})}
              placeholder="0"
            />
            <Input
              value={prescription.od_ax}
              onChange={(e) => setPrescription({...prescription, od_ax: e.target.value})}
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="font-medium flex items-center">OS</div>
            <Input
              value={prescription.os_sph}
              onChange={(e) => setPrescription({...prescription, os_sph: e.target.value})}
              placeholder="0"
            />
            <Input
              value={prescription.os_cyl}
              onChange={(e) => setPrescription({...prescription, os_cyl: e.target.value})}
              placeholder="0"
            />
            <Input
              value={prescription.os_ax}
              onChange={(e) => setPrescription({...prescription, os_ax: e.target.value})}
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pd">Pd</Label>
              <Input
                id="pd"
                value={prescription.pd}
                onChange={(e) => setPrescription({...prescription, pd: e.target.value})}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="add">Add</Label>
              <Input
                id="add"
                value={prescription.add}
                onChange={(e) => setPrescription({...prescription, add: e.target.value})}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Товары</h3>
            <Button onClick={addItem} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Добавить товар
            </Button>
          </div>
          
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-6">
                  <Label>Наименование</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder="Введите название товара"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Кол-во</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-3">
                  <Label>Цена (₸)</Label>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-1">
                  {items.length > 1 && (
                    <Button
                      onClick={() => removeItem(item.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Итого:</span>
            <span className="font-bold">{total.toLocaleString()} ₸</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paid">Оплачено (₸)</Label>
              <Input
                id="paid"
                type="number"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Долг</Label>
              <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center">
                <span className={debt > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                  {debt.toLocaleString()} ₸
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4">
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Сохранить</span>
          </Button>
          <Button onClick={handlePrint} variant="outline" className="flex items-center space-x-2">
            <Printer className="w-4 h-4" />
            <span>PDF</span>
          </Button>
          <Button onClick={handleWhatsApp} variant="outline" className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
