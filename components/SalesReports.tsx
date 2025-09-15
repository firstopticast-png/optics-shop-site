'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, DollarSign, ShoppingCart, Users, Calendar, BarChart3 } from 'lucide-react'

interface SalesData {
  id: string
  date: string
  clientName: string
  orderNumber: string
  products: string[]
  totalAmount: number
  profit: number
  status: 'completed' | 'pending' | 'cancelled'
  paymentMethod: string
}

interface SalesStats {
  totalRevenue: number
  totalOrders: number
  totalClients: number
  averageOrderValue: number
  totalProfit: number
  profitMargin: number
}

export default function SalesReports() {
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [stats, setStats] = useState<SalesStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalClients: 0,
    averageOrderValue: 0,
    totalProfit: 0,
    profitMargin: 0
  })
  const [timeFilter, setTimeFilter] = useState('month')
  const [statusFilter, setStatusFilter] = useState('all')

  // Load sales data from localStorage on component mount
  useEffect(() => {
    const savedSales = localStorage.getItem('optics-sonata-sales')
    if (savedSales) {
      setSalesData(JSON.parse(savedSales))
    } else {
      // Add some sample data
      const sampleSales: SalesData[] = [
        {
          id: '1',
          date: '2024-12-15',
          clientName: 'Иван Петров',
          orderNumber: '2025-001',
          products: ['Оправы Ray-Ban Aviator', 'Прогрессивные линзы'],
          totalAmount: 70000,
          profit: 25000,
          status: 'completed',
          paymentMethod: 'Наличные'
        },
        {
          id: '2',
          date: '2024-12-14',
          clientName: 'Мария Сидорова',
          orderNumber: '2025-002',
          products: ['Солнцезащитные очки', 'Футляр'],
          totalAmount: 28000,
          profit: 12000,
          status: 'completed',
          paymentMethod: 'Карта'
        },
        {
          id: '3',
          date: '2024-12-13',
          clientName: 'Алексей Козлов',
          orderNumber: '2025-003',
          products: ['Оправы', 'Линзы', 'Услуга подгонки'],
          totalAmount: 55000,
          profit: 20000,
          status: 'pending',
          paymentMethod: 'Перевод'
        },
        {
          id: '4',
          date: '2024-12-12',
          clientName: 'Елена Новикова',
          orderNumber: '2025-004',
          products: ['Детские очки'],
          totalAmount: 15000,
          profit: 6000,
          status: 'completed',
          paymentMethod: 'Наличные'
        },
        {
          id: '5',
          date: '2024-12-11',
          clientName: 'Дмитрий Волков',
          orderNumber: '2025-005',
          products: ['Спортивные очки'],
          totalAmount: 35000,
          profit: 15000,
          status: 'cancelled',
          paymentMethod: 'Карта'
        }
      ]
      setSalesData(sampleSales)
      localStorage.setItem('optics-sonata-sales', JSON.stringify(sampleSales))
    }
  }, [])

  // Calculate stats whenever sales data changes
  useEffect(() => {
    const filteredData = getFilteredData()
    const totalRevenue = filteredData.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const totalOrders = filteredData.length
    const totalClients = new Set(filteredData.map(sale => sale.clientName)).size
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const totalProfit = filteredData.reduce((sum, sale) => sum + sale.profit, 0)
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    setStats({
      totalRevenue,
      totalOrders,
      totalClients,
      averageOrderValue,
      totalProfit,
      profitMargin
    })
  }, [salesData, timeFilter, statusFilter])

  const getFilteredData = () => {
    let filtered = salesData

    // Filter by time
    const now = new Date()
    const filterDate = new Date()
    
    switch (timeFilter) {
      case 'week':
        filterDate.setDate(now.getDate() - 7)
        break
      case 'month':
        filterDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1)
        break
    }

    if (timeFilter !== 'all') {
      filtered = filtered.filter(sale => new Date(sale.date) >= filterDate)
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === statusFilter)
    }

    return filtered
  }

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Завершен</Badge>
      case 'pending':
        return <Badge variant="secondary">В обработке</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Отменен</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredData = getFilteredData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Отчеты по продажам</h2>
          <p className="text-gray-500 mt-1">Аналитика продаж и доходов</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">За неделю</SelectItem>
              <SelectItem value="month">За месяц</SelectItem>
              <SelectItem value="quarter">За квартал</SelectItem>
              <SelectItem value="year">За год</SelectItem>
              <SelectItem value="all">За все время</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="completed">Завершенные</SelectItem>
              <SelectItem value="pending">В обработке</SelectItem>
              <SelectItem value="cancelled">Отмененные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общая выручка</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +12% с прошлого периода
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Количество заказов</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +8% с прошлого периода
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Клиентов</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +5% с прошлого периода
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средний чек</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              +3% с прошлого периода
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profit Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Анализ прибыли</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Общая прибыль:</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(stats.totalProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Маржа прибыли:</span>
              <span className="text-lg font-bold text-blue-600">
                {stats.profitMargin.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${Math.min(stats.profitMargin, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Статистика по периодам</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              Период: {timeFilter === 'week' ? 'Неделя' : 
                      timeFilter === 'month' ? 'Месяц' :
                      timeFilter === 'quarter' ? 'Квартал' :
                      timeFilter === 'year' ? 'Год' : 'Все время'}
            </div>
            <div className="text-sm text-gray-600">
              Статус: {statusFilter === 'all' ? 'Все заказы' :
                      statusFilter === 'completed' ? 'Завершенные' :
                      statusFilter === 'pending' ? 'В обработке' : 'Отмененные'}
            </div>
            <div className="text-sm text-gray-600">
              Показано заказов: {filteredData.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Детализация продаж</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Номер заказа</TableHead>
                  <TableHead>Товары</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Прибыль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Оплата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{formatDate(sale.date)}</TableCell>
                    <TableCell className="font-medium">{sale.clientName}</TableCell>
                    <TableCell className="font-mono">{sale.orderNumber}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {sale.products.map((product, index) => (
                          <div key={index} className="text-sm text-gray-600 truncate">
                            {product}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(sale.totalAmount)}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(sale.profit)}
                    </TableCell>
                    <TableCell>{getStatusBadge(sale.status)}</TableCell>
                    <TableCell>{sale.paymentMethod}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
