'use client'

import { useState } from 'react'
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
  }

  const handlePrint = () => {
    const doc = new jsPDF()
    
    // Set font to monospace for professional look
    doc.setFont('courier')
    
    // Header with logo area
    doc.setFontSize(16)
    doc.setFont('courier', 'bold')
    doc.text('ОПТИКА СОНАТА', 20, 25)
    
    // Contact info
    doc.setFontSize(10)
    doc.setFont('courier', 'normal')
    doc.text('WhatsApp: +7 700 743 9775', 20, 35)
    doc.text('Instagram: sonata.astana', 20, 42)
    
    // Order number and date (top right)
    doc.setFontSize(12)
    doc.setFont('courier', 'bold')
    doc.text(`Заказ № ${orderNumber}`, 150, 25)
    doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 150, 35)
    
    // Customer Information Section
    doc.setFontSize(14)
    doc.setFont('courier', 'bold')
    doc.text('ИНФОРМАЦИЯ О КЛИЕНТЕ:', 20, 55)
    
    doc.setFontSize(12)
    doc.setFont('courier', 'normal')
    doc.text(`ФИО: ${customerName || 'Не указано'}`, 20, 65)
    doc.text(`Телефон: ${customerPhone || 'Не указано'}`, 20, 75)
    doc.text(`Дата заказа: ${orderDate}`, 20, 85)
    if (readyDate) {
      doc.text(`Готовность: ${readyDate}`, 20, 95)
    }
    
    // Prescription Section
    if (prescription.od_sph || prescription.os_sph) {
      doc.setFontSize(14)
      doc.setFont('courier', 'bold')
      doc.text('РЕЦЕПТ:', 20, 115)
      
      doc.setFontSize(12)
      doc.setFont('courier', 'normal')
      
      // Prescription table with proper alignment
      doc.text('Глаз', 20, 130)
      doc.text('Sph', 60, 130)
      doc.text('Cyl', 90, 130)
      doc.text('Ax', 120, 130)
      
      // OD (Right eye)
      doc.text('OD', 20, 145)
      doc.text(prescription.od_sph || '-', 60, 145)
      doc.text(prescription.od_cyl || '-', 90, 145)
      doc.text(prescription.od_ax || '-', 120, 145)
      
      // OS (Left eye)
      doc.text('OS', 20, 160)
      doc.text(prescription.os_sph || '-', 60, 160)
      doc.text(prescription.os_cyl || '-', 90, 160)
      doc.text(prescription.os_ax || '-', 120, 160)
      
      // PD and Add
      doc.text(`Pd: ${prescription.pd || '-'}`, 20, 175)
      doc.text(`Add: ${prescription.add || '-'}`, 90, 175)
    }
    
    // Items Section
    doc.setFontSize(14)
    doc.setFont('courier', 'bold')
    doc.text('ТОВАРЫ:', 20, 195)
    
    doc.setFontSize(12)
    doc.setFont('courier', 'normal')
    
    let yPosition = 210
    items.forEach((item, index) => {
      if (item.name) {
        doc.text(`${index + 1}. ${item.name}`, 20, yPosition)
        doc.text(`Кол-во: ${item.quantity}`, 120, yPosition)
        doc.text(`Цена: ${parseFloat(item.price || '0').toLocaleString()} ₸`, 150, yPosition)
        doc.text(`Итого: ${(parseFloat(item.price || '0') * parseFloat(item.quantity || '0')).toLocaleString()} ₸`, 180, yPosition)
        yPosition += 12
      }
    })
    
    // Totals Section with proper formatting
    doc.setFontSize(14)
    doc.setFont('courier', 'bold')
    doc.text(`Общая сумма: ${total.toLocaleString()} ₸`, 20, yPosition + 20)
    
    if (parseFloat(paid || '0') > 0) {
      doc.text(`Оплачено: ${parseFloat(paid || '0').toLocaleString()} ₸`, 20, yPosition + 35)
    }
    
    if (debt > 0) {
      doc.setFont('courier', 'bold')
      doc.setTextColor(255, 0, 0) // Red color for debt
      doc.text(`Долг: ${debt.toLocaleString()} ₸`, 20, yPosition + 50)
      doc.setTextColor(0, 0, 0) // Reset to black
    }
    
    // Footer with contact info
    doc.setFontSize(10)
    doc.setFont('courier', 'normal')
    doc.text('Астана, Сыганак 32', 20, doc.internal.pageSize.height - 30)
    doc.text('WhatsApp: +7 700 743 9770', 20, doc.internal.pageSize.height - 20)
    doc.text('Instagram: sonata.astana', 20, doc.internal.pageSize.height - 10)
    
    // Save the PDF
    doc.save(`order-${orderNumber}.pdf`)
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
          <div>
            <Label htmlFor="customerName">ФИО</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Введите ФИО клиента"
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Тел.</Label>
            <Input
              id="customerPhone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+7 700 000 0000"
            />
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
