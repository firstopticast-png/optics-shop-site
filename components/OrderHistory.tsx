'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Eye, EyeOff, Calendar, User, Phone, Save, Printer, MessageCircle, Edit, Plus, Trash2 } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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

interface Client {
  id: string
  name: string
  phone: string
  birthDate: string
  registrationDate: string
  totalOrders: number
  totalSpent: number
  lastVisit: string
  notes: string
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  
  // Client validation states
  const [clients, setClients] = useState<Client[]>([])
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [clientValidationData, setClientValidationData] = useState<{
    order: Order | null
    existingClient: Client | null
    isMismatch: boolean
  } | null>(null)

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

  // Load clients from localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('optics-sonata-clients')
    if (savedClients) {
      setClients(JSON.parse(savedClients))
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

  const addItemToOrder = () => {
    if (!editingOrder) return
    const newItem = { id: Date.now().toString(), name: '', quantity: '', price: '' }
    setEditingOrder({
      ...editingOrder,
      items: [...editingOrder.items, newItem]
    })
  }

  const removeItemFromOrder = (itemId: string) => {
    if (!editingOrder) return
    setEditingOrder({
      ...editingOrder,
      items: editingOrder.items.filter(item => item.id !== itemId)
    })
  }

  const updateItemInOrder = (itemId: string, field: keyof OrderItem, value: string) => {
    if (!editingOrder) return
    setEditingOrder({
      ...editingOrder,
      items: editingOrder.items.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    })
  }

  // Client validation functions
  const validateClientData = (order: Order) => {
    const existingClient = clients.find(client => 
      client.name.toLowerCase() === order.customerName.toLowerCase() || 
      client.phone === order.customerPhone
    )
    
    if (!existingClient) {
      // Client doesn't exist
      return { existingClient: null, isMismatch: false }
    }
    
    // Check if data matches
    const isMismatch = existingClient.name.toLowerCase() !== order.customerName.toLowerCase() ||
                      existingClient.phone !== order.customerPhone
    
    return { existingClient, isMismatch }
  }

  const handleClientValidation = (order: Order) => {
    const validation = validateClientData(order)
    
    if (!validation.existingClient || validation.isMismatch) {
      // Show warning dialog
      setClientValidationData({
        order,
        existingClient: validation.existingClient,
        isMismatch: validation.isMismatch
      })
      setShowClientDialog(true)
      return false
    }
    
    return true
  }

  const handleCreateOrUpdateClient = () => {
    if (!clientValidationData?.order) return
    
    const { order, existingClient } = clientValidationData
    
    if (existingClient) {
      // Update existing client
      const updatedClient = {
        ...existingClient,
        name: order.customerName,
        phone: order.customerPhone,
        lastVisit: order.orderDate
      }
      
      const updatedClients = clients.map(client => 
        client.id === existingClient.id ? updatedClient : client
      )
      setClients(updatedClients)
      localStorage.setItem('optics-sonata-clients', JSON.stringify(updatedClients))
    } else {
      // Create new client
      const newClient: Client = {
        id: Date.now().toString(),
        name: order.customerName,
        phone: order.customerPhone,
        birthDate: '',
        registrationDate: order.orderDate,
        totalOrders: 1,
        totalSpent: order.total,
        lastVisit: order.orderDate,
        notes: ''
      }
      
      const updatedClients = [...clients, newClient]
      setClients(updatedClients)
      localStorage.setItem('optics-sonata-clients', JSON.stringify(updatedClients))
    }
    
    // Close dialog and proceed with order save
    setShowClientDialog(false)
    setClientValidationData(null)
    proceedWithOrderSave()
  }

  const proceedWithOrderSave = () => {
    if (!editingOrder) return
    
    // Update the order in the orders array
    const updatedOrders = orders.map(o => o.id === editingOrder.id ? editingOrder : o)
    setOrders(updatedOrders)
    
    // Save to localStorage
    localStorage.setItem('optics-sonata-orders', JSON.stringify(updatedOrders))
    
    // Show success message
    alert('Заказ обновлен!')
    
    // Exit edit mode
    setEditingOrder(null)
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
    
    // Check client data validation
    if (!handleClientValidation(editingOrder)) {
      return // Dialog will handle the rest
    }
    
    // Proceed with order save if validation passes
    proceedWithOrderSave()
  }

  const handlePrintOrder = async (order: Order) => {
    try {
      // Create a temporary div for PDF generation
      const printDiv = document.createElement('div')
      printDiv.style.position = 'absolute'
      printDiv.style.left = '-9999px'
      printDiv.style.top = '-9999px'
      printDiv.style.width = '210mm'
      printDiv.style.padding = '20mm'
      printDiv.style.fontFamily = 'Arial, sans-serif'
      printDiv.style.fontSize = '12px'
      printDiv.style.lineHeight = '1.4'
      printDiv.style.color = '#000'
      printDiv.style.backgroundColor = '#fff'
      
      // Add content to the div
      printDiv.innerHTML = `
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
            <div style="font-weight: bold;">Заказ № ${order.orderNumber}</div>
            <div>Дата: ${new Date(order.orderDate).toLocaleDateString('ru-RU')}</div>
          </div>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #1f2937;">ИНФОРМАЦИЯ О КЛИЕНТЕ</h2>
          <div style="font-size: 14px; line-height: 1.6;">
            <div><strong>ФИО:</strong> ${order.customerName}</div>
            <div><strong>Телефон:</strong> ${order.customerPhone}</div>
            <div><strong>Дата заказа:</strong> ${order.orderDate}</div>
            ${order.readyDate ? `<div><strong>Готовность:</strong> ${order.readyDate}</div>` : ''}
          </div>
        </div>
        
        ${order.prescription.od_sph || order.prescription.os_sph ? `
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
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${order.prescription.od_sph || '-'}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${order.prescription.od_cyl || '-'}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${order.prescription.od_ax || '-'}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; font-weight: bold;">OS</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${order.prescription.os_sph || '-'}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${order.prescription.os_cyl || '-'}</td>
                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${order.prescription.os_ax || '-'}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 10px; font-size: 14px;">
            <span style="margin-right: 30px;"><strong>Pd:</strong> ${order.prescription.pd || '-'}</span>
            <span><strong>Add:</strong> ${order.prescription.add || '-'}</span>
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
              ${order.items.filter(item => item.name).map((item, index) => `
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
            Общая сумма: ${order.total.toLocaleString()} ₸
          </div>
          ${order.paid > 0 ? `
            <div style="font-size: 14px; margin-bottom: 5px;">
              Оплачено: ${order.paid.toLocaleString()} ₸
            </div>
          ` : ''}
          ${order.debt > 0 ? `
            <div style="font-size: 14px; color: #dc2626; font-weight: bold;">
              Долг: ${order.debt.toLocaleString()} ₸
            </div>
          ` : ''}
        </div>
        
        <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #d1d5db; font-size: 12px; color: #6b7280; text-align: center;">
          <div>Астана, Сыганак 32</div>
          <div>WhatsApp: +7 700 743 9770 | Instagram: sonata.astana</div>
        </div>
      `
      
      // Add to DOM
      document.body.appendChild(printDiv)
      
      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Capture the element as canvas
      const canvas = await html2canvas(printDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Calculate dimensions to fit the content on one page
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // If content fits on one page, add it directly
      if (imgHeight <= pageHeight) {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight)
      } else {
        // Scale down to fit on one page
        const scale = pageHeight / imgHeight
        const scaledWidth = imgWidth * scale
        const scaledHeight = pageHeight
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, scaledWidth, scaledHeight)
      }
      
      // Download the PDF
      pdf.save(`order-${order.orderNumber}.pdf`)
      
      // Clean up
      document.body.removeChild(printDiv)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Ошибка при создании PDF')
    }
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
                        {editingOrder?.id === order.id ? (
                          <Input
                            value={editingOrder.customerName}
                            onChange={(e) => setEditingOrder({...editingOrder, customerName: e.target.value})}
                            className="h-6 text-sm font-medium"
                            placeholder="Имя клиента"
                          />
                        ) : (
                          <span className="font-medium">{order.customerName}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {editingOrder?.id === order.id ? (
                          <Input
                            value={editingOrder.customerPhone}
                            onChange={(e) => setEditingOrder({...editingOrder, customerPhone: e.target.value})}
                            className="h-6 text-sm"
                            placeholder="Телефон"
                          />
                        ) : (
                          <span className="text-sm text-gray-600">{order.customerPhone}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
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
                              {editingOrder?.id === order.id ? (
                                <>
                                  <Input
                                    value={editingOrder.prescription.od_sph}
                                    onChange={(e) => setEditingOrder({
                                      ...editingOrder,
                                      prescription: { ...editingOrder.prescription, od_sph: e.target.value }
                                    })}
                                    className="h-8 text-center text-sm"
                                    placeholder="0"
                                  />
                                  <Input
                                    value={editingOrder.prescription.od_cyl}
                                    onChange={(e) => setEditingOrder({
                                      ...editingOrder,
                                      prescription: { ...editingOrder.prescription, od_cyl: e.target.value }
                                    })}
                                    className="h-8 text-center text-sm"
                                    placeholder="0"
                                  />
                                  <Input
                                    value={editingOrder.prescription.od_ax}
                                    onChange={(e) => setEditingOrder({
                                      ...editingOrder,
                                      prescription: { ...editingOrder.prescription, od_ax: e.target.value }
                                    })}
                                    className="h-8 text-center text-sm"
                                    placeholder="0"
                                  />
                                </>
                              ) : (
                                <>
                                  <div className="bg-white p-2 rounded text-center text-sm">{order.prescription.od_sph || '-'}</div>
                                  <div className="bg-white p-2 rounded text-center text-sm">{order.prescription.od_cyl || '-'}</div>
                                  <div className="bg-white p-2 rounded text-center text-sm">{order.prescription.od_ax || '-'}</div>
                                </>
                              )}
                            </div>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                              <div className="font-medium text-sm flex items-center">OS</div>
                              {editingOrder?.id === order.id ? (
                                <>
                                  <Input
                                    value={editingOrder.prescription.os_sph}
                                    onChange={(e) => setEditingOrder({
                                      ...editingOrder,
                                      prescription: { ...editingOrder.prescription, os_sph: e.target.value }
                                    })}
                                    className="h-8 text-center text-sm"
                                    placeholder="0"
                                  />
                                  <Input
                                    value={editingOrder.prescription.os_cyl}
                                    onChange={(e) => setEditingOrder({
                                      ...editingOrder,
                                      prescription: { ...editingOrder.prescription, os_cyl: e.target.value }
                                    })}
                                    className="h-8 text-center text-sm"
                                    placeholder="0"
                                  />
                                  <Input
                                    value={editingOrder.prescription.os_ax}
                                    onChange={(e) => setEditingOrder({
                                      ...editingOrder,
                                      prescription: { ...editingOrder.prescription, os_ax: e.target.value }
                                    })}
                                    className="h-8 text-center text-sm"
                                    placeholder="0"
                                  />
                                </>
                              ) : (
                                <>
                                  <div className="bg-white p-2 rounded text-center text-sm">{order.prescription.os_sph || '-'}</div>
                                  <div className="bg-white p-2 rounded text-center text-sm">{order.prescription.os_cyl || '-'}</div>
                                  <div className="bg-white p-2 rounded text-center text-sm">{order.prescription.os_ax || '-'}</div>
                                </>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Pd:</span>
                                {editingOrder?.id === order.id ? (
                                  <Input
                                    value={editingOrder.prescription.pd}
                                    onChange={(e) => setEditingOrder({
                                      ...editingOrder,
                                      prescription: { ...editingOrder.prescription, pd: e.target.value }
                                    })}
                                    className="h-6 w-16 text-sm"
                                    placeholder="0"
                                  />
                                ) : (
                                  <span className="text-sm font-medium">{order.prescription.pd || '-'}</span>
                                )}
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Add:</span>
                                {editingOrder?.id === order.id ? (
                                  <Input
                                    value={editingOrder.prescription.add}
                                    onChange={(e) => setEditingOrder({
                                      ...editingOrder,
                                      prescription: { ...editingOrder.prescription, add: e.target.value }
                                    })}
                                    className="h-6 w-16 text-sm"
                                    placeholder="0"
                                  />
                                ) : (
                                  <span className="text-sm font-medium">{order.prescription.add || '-'}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold">Товары</h4>
                          {editingOrder?.id === order.id && (
                            <Button 
                              onClick={addItemToOrder} 
                              size="sm" 
                              variant="outline"
                              className="flex items-center space-x-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Добавить</span>
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {(editingOrder?.id === order.id ? editingOrder.items : order.items).map((item) => (
                            <div key={item.id} className="bg-gray-50 p-3 rounded">
                              {editingOrder?.id === order.id ? (
                                <div className="grid grid-cols-12 gap-2 items-end">
                                  <div className="col-span-6">
                                    <Input
                                      value={item.name}
                                      onChange={(e) => updateItemInOrder(item.id, 'name', e.target.value)}
                                      placeholder="Название товара"
                                      className="text-sm"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => updateItemInOrder(item.id, 'quantity', e.target.value)}
                                      placeholder="Кол-во"
                                      className="text-sm"
                                    />
                                  </div>
                                  <div className="col-span-3">
                                    <Input
                                      type="number"
                                      value={item.price}
                                      onChange={(e) => updateItemInOrder(item.id, 'price', e.target.value)}
                                      placeholder="Цена"
                                      className="text-sm"
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <Button
                                      onClick={() => removeItemFromOrder(item.id)}
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-500 hover:text-red-700 p-1"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center">
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
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        {(() => {
                          const currentOrder = editingOrder?.id === order.id ? editingOrder : order
                          const currentTotal = currentOrder.items.reduce((sum, item) => 
                            sum + (parseFloat(item.price || "0") * parseFloat(item.quantity || "0")), 0
                          )
                          const currentDebt = currentTotal - currentOrder.paid
                          
                          return (
                            <>
                              <div className="flex justify-between items-center text-lg font-semibold">
                                <span>Общая сумма:</span>
                                <span>{formatCurrency(currentTotal)}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                                <span>Оплачено:</span>
                                <span>{formatCurrency(currentOrder.paid)}</span>
                              </div>
                              {currentDebt > 0 && (
                                <div className="flex justify-between items-center text-sm text-red-600 mt-1">
                                  <span>Долг:</span>
                                  <span className="font-semibold">{formatCurrency(currentDebt)}</span>
                                </div>
                              )}
                            </>
                          )
                        })()}
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

      {/* Client Validation Dialog */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Проверка данных клиента</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {clientValidationData?.isMismatch ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Данные клиента в заказе не совпадают с базой клиентов:
                </p>
                <div className="bg-yellow-50 p-3 rounded-md">
                  <p className="text-sm font-medium">В заказе:</p>
                  <p className="text-sm">Имя: {clientValidationData.order?.customerName}</p>
                  <p className="text-sm">Телефон: {clientValidationData.order?.customerPhone}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-md mt-2">
                  <p className="text-sm font-medium">В базе клиентов:</p>
                  <p className="text-sm">Имя: {clientValidationData.existingClient?.name}</p>
                  <p className="text-sm">Телефон: {clientValidationData.existingClient?.phone}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Клиент с такими данными не найден в базе клиентов:
                </p>
                <div className="bg-yellow-50 p-3 rounded-md">
                  <p className="text-sm">Имя: {clientValidationData?.order?.customerName}</p>
                  <p className="text-sm">Телефон: {clientValidationData?.order?.customerPhone}</p>
                </div>
              </div>
            )}
            
            <p className="text-sm font-medium">
              Создать/Редактировать данные о клиенте?
            </p>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleCreateOrUpdateClient}
                className="flex-1"
              >
                Да
              </Button>
              <Button 
                onClick={() => {
                  setShowClientDialog(false)
                  setClientValidationData(null)
                  proceedWithOrderSave()
                }}
                variant="outline"
                className="flex-1"
              >
                Нет
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
