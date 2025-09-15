'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, Eye, EyeOff, Calendar, User, Phone, DollarSign } from 'lucide-react'

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
            os_sph: '+1.25', os_cyl: '0', od_ax: '0',
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
                              <span>{order.readyDate ? formatDate(order.readyDate) : 'Не указана'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Статус:</span>
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusLabel(order.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Информация о клиенте</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">ФИО:</span>
                              <span>{order.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Телефон:</span>
                              <span>{order.customerPhone}</span>
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
