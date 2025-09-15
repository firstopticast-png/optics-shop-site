'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, Eye, EyeOff, Calendar, User, Phone, DollarSign, Save, Printer, MessageCircle, Edit } from 'lucide-react'
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

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  orderDate: string
  readyDate: string
  prescription: PrescriptionData
  items: OrderItem[]
  total: number
  paid: number
  debt: number
  createdAt: string
  status: string
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  // Load orders from localStorage on component mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('optics-sonata-orders')
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    } else {
      // Add some sample data if no orders exist
      const sampleOrders: Order[] = [
        {
          id: '1',
          orderNumber: '2025-001',
          customerName: 'Иван Петров',
          customerPhone: '+7 (727) 123-45-67',
          orderDate: '2024-12-15',
          readyDate: '2024-12-20',
          prescription: {
            od_sph: '-2.5', od_cyl: '-0.5', od_ax: '90',
            os_sph: '-2.0', os_cyl: '-0.75', os_ax: '85',
            pd: '62', add: '2.0'
          },
          items: [
            { id: '1', name: 'Оправы Ray-Ban Aviator', quantity: '1', price: '25000' },
            { id: '2', name: 'Прогрессивные линзы', quantity: '1', price: '45000' }
          ],
          total: 70000,
          paid: 70000,
          debt: 0,
          createdAt: '2024-12-15T10:30:00.000Z',
          status: 'completed'
        },
        {
          id: '2',
          orderNumber: '2025-002',
          customerName: 'Мария Сидорова',
          customerPhone: '+7 (727) 234-56-78',
          orderDate: '2024-12-14',
          readyDate: '2024-12-18',
          prescription: {
            od_sph: '+1.5', od_cyl: '0', od_ax: '0',
            os_sph: '+1.25', os_cyl: '0', os_ax: '0',
            pd: '60', add: '1.5'
          },
          items: [
            { id: '1', name: 'Солнцезащитные очки', quantity: '1', price: '18000' },
            { id: '2', name: 'Футляр', quantity: '1', price: '10000' }
          ],
          total: 28000,
          paid: 15000,
          debt: 13000,
          createdAt: '2024-12-14T14:20:00.000Z',
          status: 'pending'
        },
        {
          id: '3',
          orderNumber: '2025-003',
          customerName: 'Алексей Козлов',
          customerPhone: '+7 (727) 345-67-89',
          orderDate: '2024-12-13',
          readyDate: '2024-12-19',
          prescription: {
            od_sph: '-3.0', od_cyl: '-1.0', od_ax: '180',
            os_sph: '-2.75', os_cyl: '-0.5', os_ax: '175',
            pd: '64', add: '2.5'
          },
          items: [
            { id: '1', name: 'Оправы', quantity: '1', price: '20000' },
            { id: '2', name: 'Линзы', quantity: '1', price: '30000' },
            { id: '3', name: 'Услуга подгонки', quantity: '1', price: '5000' }
          ],
          total: 55000,
          paid: 0,
          debt: 55000,
          createdAt: '2024-12-13T09:15:00.000Z',
          status: 'active'
        }
      ]
      setOrders(sampleOrders)
      localStorage.setItem('optics-sonata-orders', JSON.stringify(sampleOrders))
    }
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerPhone.includes(searchTerm)
    return matchesSearch
  }).sort((a, b) => {
    // Sort by createdAt date in descending order (latest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершен'
      case 'pending':
        return 'Ожидает'
      case 'active':
        return 'В работе'
      default:
        return 'Неизвестно'
    }
  }

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
  }

  const handleSaveOrder = () => {
    if (!editingOrder) return
    
    // Validate required fields
    if (!editingOrder.customerName.trim()) {
      alert('Пожалуйста, укажите ФИО клиента')
      return
    }
    
    if (!editingOrder.customerPhone.trim()) {
      alert('Пожалуйста, укажите номер телефона клиента')
      return
    }
    
    // Update the order in the orders array
    const updatedOrders = orders.map(o => o.id === editingOrder.id ? editingOrder : o)
    setOrders(updatedOrders)
    
    // Save to localStorage
    localStorage.setItem('optics-sonata-orders', JSON.stringify(updatedOrders))
    
    // Show success message
    alert(`Заказ №${editingOrder.orderNumber} успешно обновлен!`)
    
    // Exit edit mode
    setEditingOrder(null)
  }

  const handlePrintOrder = (order: Order) => {
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
    doc.text(`Заказ № ${order.orderNumber}`, 150, 25)
    doc.text(`Дата: ${new Date(order.orderDate).toLocaleDateString('ru-RU')}`, 150, 35)
    
    // Customer Information Section
    doc.setFontSize(14)
    doc.setFont('courier', 'bold')
    doc.text('ИНФОРМАЦИЯ О КЛИЕНТЕ:', 20, 55)
    
    doc.setFontSize(12)
    doc.setFont('courier', 'normal')
    doc.text(`ФИО: ${order.customerName}`, 20, 65)
    doc.text(`Телефон: ${order.customerPhone}`, 20, 75)
    doc.text(`Дата заказа: ${order.orderDate}`, 20, 85)
    if (order.readyDate) {
      doc.text(`Готовность: ${order.readyDate}`, 20, 95)
    }
    
    // Prescription Section
    if (order.prescription.od_sph || order.prescription.os_sph) {
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
      doc.text(order.prescription.od_sph || '-', 60, 145)
      doc.text(order.prescription.od_cyl || '-', 90, 145)
      doc.text(order.prescription.od_ax || '-', 120, 145)
      
      // OS (Left eye)
      doc.text('OS', 20, 160)
      doc.text(order.prescription.os_sph || '-', 60, 160)
      doc.text(order.prescription.os_cyl || '-', 90, 160)
      doc.text(order.prescription.os_ax || '-', 120, 160)
      
      // PD and Add
      doc.text(`Pd: ${order.prescription.pd || '-'}`, 20, 175)
      doc.text(`Add: ${order.prescription.add || '-'}`, 90, 175)
    }
    
    // Items Section
    doc.setFontSize(14)
    doc.setFont('courier', 'bold')
    doc.text('ТОВАРЫ:', 20, 195)
    
    doc.setFontSize(12)
    doc.setFont('courier', 'normal')
    
    let yPosition = 210
    order.items.forEach((item, index) => {
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
    doc.text(`Общая сумма: ${order.total.toLocaleString()} ₸`, 20, yPosition + 20)
    
    if (order.paid > 0) {
      doc.text(`Оплачено: ${order.paid.toLocaleString()} ₸`, 20, yPosition + 35)
    }
    
    if (order.debt > 0) {
      doc.setFont('courier', 'bold')
      doc.setTextColor(255, 0, 0) // Red color for debt
      doc.text(`Долг: ${order.debt.toLocaleString()} ₸`, 20, yPosition + 50)
      doc.setTextColor(0, 0, 0) // Reset to black
    }
    
    // Footer with contact info
    doc.setFontSize(10)
    doc.setFont('courier', 'normal')
    doc.text('Астана, Сыганак 32', 20, doc.internal.pageSize.height - 30)
    doc.text('WhatsApp: +7 700 743 9770', 20, doc.internal.pageSize.height - 20)
    doc.text('Instagram: sonata.astana', 20, doc.internal.pageSize.height - 10)
    
    // Save the PDF
    doc.save(`order-${order.orderNumber}.pdf`)
  }

  const handleWhatsAppOrder = (order: Order) => {
    if (!order.customerPhone) {
      alert('Номер телефона клиента не указан')
      return
    }
    
    // Format phone number (remove spaces, dashes, parentheses)
    const cleanPhone = order.customerPhone.replace(/[\s\-\(\)]/g, '')
    
    // Create WhatsApp message
    let message = `Здравствуйте! Ваш заказ №${order.orderNumber} готов.\n\n`
    message += `📋 Детали заказа:\n`
    message += `• Дата заказа: ${order.orderDate}\n`
    if (order.readyDate) {
      message += `• Готовность: ${order.readyDate}\n`
    }
    message += `• Общая сумма: ${order.total.toLocaleString()} ₸\n`
    
    if (order.paid > 0) {
      message += `• Оплачено: ${order.paid.toLocaleString()} ₸\n`
    }
    
    if (order.debt > 0) {
      message += `• Долг: ${order.debt.toLocaleString()} ₸\n`
    }
    
    // Add prescription if available
    if (order.prescription.od_sph || order.prescription.os_sph) {
      message += `\n👁 Рецепт:\n`
      message += `OD: ${order.prescription.od_sph || '-'}/${order.prescription.od_cyl || '-'}×${order.prescription.od_ax || '-'}\n`
      message += `OS: ${order.prescription.os_sph || '-'}/${order.prescription.os_cyl || '-'}×${order.prescription.os_ax || '-'}\n`
      message += `Pd: ${order.prescription.pd || '-'}, Add: ${order.prescription.add || '-'}\n`
    }
    
    // Add items
    if (order.items.some(item => item.name)) {
      message += `\n🛍 Товары:\n`
      order.items.forEach((item, index) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">История заказов</h2>
          <p className="text-gray-500 mt-1">Просмотр всех заказов</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск по номеру заказа, имени клиента или телефону..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">Заказы не найдены</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Order Summary Row */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrderExpansion(order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {expandedOrder === order.id ? (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="font-mono text-sm text-gray-600">#{order.orderNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{formatDate(order.orderDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{order.customerName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{order.customerPhone}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
                        </div>
                        {order.debt > 0 && (
                          <div className="text-sm text-red-600">
                            Долг: {formatCurrency(order.debt)}
                          </div>
                        )}
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order.id && (
                  <>
                    <Separator />
                    <div className="p-6 space-y-6">
                      {/* Order Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">Информация о заказе</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Номер заказа:</span>
                              <span className="font-mono">{order.orderNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Дата заказа:</span>
                              <span>{formatDate(order.orderDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Готовность:</span>
                              {editingOrder?.id === order.id ? (
                                <Input
                                  type="date"
                                  value={editingOrder.readyDate}
                                  onChange={(e) => setEditingOrder({...editingOrder, readyDate: e.target.value})}
                                  className="w-32 h-6 text-xs"
                                />
                              ) : (
                                <span>{order.readyDate ? formatDate(order.readyDate) : 'Не указана'}</span>
                              )}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Статус:</span>
                              {editingOrder?.id === order.id ? (
                                <select
                                  value={editingOrder.status}
                                  onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value})}
                                  className="px-2 py-1 text-xs border rounded"
                                >
                                  <option value="active">В работе</option>
                                  <option value="pending">Ожидает</option>
                                  <option value="completed">Завершен</option>
                                </select>
                              ) : (
                                <Badge className={getStatusColor(order.status)}>
                                  {getStatusLabel(order.status)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Информация о клиенте</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">ФИО:</span>
                              {editingOrder?.id === order.id ? (
                                <Input
                                  value={editingOrder.customerName}
                                  onChange={(e) => setEditingOrder({...editingOrder, customerName: e.target.value})}
                                  className="w-40 h-6 text-xs"
                                />
                              ) : (
                                <span>{order.customerName}</span>
                              )}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Телефон:</span>
                              {editingOrder?.id === order.id ? (
                                <Input
                                  value={editingOrder.customerPhone}
                                  onChange={(e) => setEditingOrder({...editingOrder, customerPhone: e.target.value})}
                                  className="w-40 h-6 text-xs"
                                />
                              ) : (
                                <span>{order.customerPhone}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Prescription */}
                      {order.prescription && (
                        <div>
                          <h4 className="font-semibold mb-3">Рецепт</h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-4 gap-2 text-center mb-2">
                              <div></div>
                              <div className="font-medium text-sm">Sph</div>
                              <div className="font-medium text-sm">Cyl</div>
                              <div className="font-medium text-sm">Ax</div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                              <div className="font-medium text-sm flex items-center">OD</div>
                              <div className="bg-white p-2 rounded text-center text-sm">{order.prescription.od_sph || '-'}</div>
                              <div className="bg-white p-2 rounded text-center text-sm">{order.prescription.od_cyl || '-'}</div>
                              <div className="bg-white p-2 rounded text-center text-sm">{order.prescription.od_ax || '-'}</div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                              <div className="font-medium text-sm flex items-center">OS</div>
                              <div className="bg-white p-2 rounded text-center text-sm">{order.prescription.os_sph || '-'}</div>
                              <div className="bg-white p-2 rounded text-center text-sm">{order.prescription.os_cyl || '-'}</div>
                              <div className="bg-white p-2 rounded text-center text-sm">{order.prescription.os_ax || '-'}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Pd:</span>
                                <span className="text-sm font-medium">{order.prescription.pd || '-'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Add:</span>
                                <span className="text-sm font-medium">{order.prescription.add || '-'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div>
                        <h4 className="font-semibold mb-3">Товары</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                              <div className="flex-1">
                                <span className="font-medium">{item.name}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Кол-во: {item.quantity}</span>
                                <span>Цена: {formatCurrency(parseFloat(item.price))}</span>
                                <span className="font-medium">
                                  Итого: {formatCurrency(parseFloat(item.price) * parseFloat(item.quantity))}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center text-lg font-semibold">
                          <span>Общая сумма:</span>
                          <span>{formatCurrency(order.total)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                          <span>Оплачено:</span>
                          <span>{formatCurrency(order.paid)}</span>
                        </div>
                        {order.debt > 0 && (
                          <div className="flex justify-between items-center text-sm text-red-600 mt-1">
                            <span>Долг:</span>
                            <span className="font-semibold">{formatCurrency(order.debt)}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-4">
                        {editingOrder?.id === order.id ? (
                          <Button 
                            onClick={handleSaveOrder} 
                            className="flex items-center space-x-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>Сохранить</span>
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleEditOrder(order)} 
                            variant="outline" 
                            className="flex items-center space-x-2"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Редактировать</span>
                          </Button>
                        )}
                        <Button 
                          onClick={() => handlePrintOrder(order)} 
                          variant="outline" 
                          className="flex items-center space-x-2"
                        >
                          <Printer className="w-4 h-4" />
                          <span>PDF</span>
                        </Button>
                        <Button 
                          onClick={() => handleWhatsAppOrder(order)} 
                          variant="outline" 
                          className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
