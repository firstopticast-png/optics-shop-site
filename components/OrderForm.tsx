'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Save, Printer, MessageCircle, Plus, Trash2 } from 'lucide-react'

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
    console.log('Saving order...', { orderNumber, customerName, customerPhone, items, total })
  }

  const handlePrint = () => {
    console.log('Generating PDF...')
  }

  const handleWhatsApp = () => {
    console.log('Sending via WhatsApp...')
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
