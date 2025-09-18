'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, TrendingUp } from 'lucide-react'

interface SalesItem {
  id: string
  date: string
  name: string
  quantity: number
  pricePerUnit: number
  salesAmount: number
  costPerUnit: number
  totalCost: number
  profit: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  orderDate: string
  readyDate?: string
  prescription: {
    od_sph: string
    od_cyl: string
    od_ax: string
    os_sph: string
    os_cyl: string
    os_ax: string
    pd: string
    add: string
  }
  items: Array<{
    id: string
    name: string
    quantity: string
    price: string
  }>
  total: number
  paid: number
  debt: number
}

interface SalesDatabaseProps {
  orders: Order[]
}

export default function SalesDatabase({ orders }: SalesDatabaseProps) {
  const [salesItems, setSalesItems] = useState<SalesItem[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('current-month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [useCustomRange, setUseCustomRange] = useState(false)

  // Convert orders to sales items
  const convertOrdersToSalesItems = (orders: Order[]): SalesItem[] => {
    const salesItems: SalesItem[] = []
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const quantity = parseFloat(item.quantity) || 0
        const pricePerUnit = parseFloat(item.price) || 0
        const salesAmount = quantity * pricePerUnit
        const costPerUnit = 0 // Default cost per unit, editable by user
        const totalCost = quantity * costPerUnit
        const profit = salesAmount - totalCost

        salesItems.push({
          id: `${order.id}-${item.id}`,
          date: order.orderDate,
          name: item.name,
          quantity,
          pricePerUnit,
          salesAmount,
          costPerUnit,
          totalCost,
          profit
        })
      })
    })
    
    return salesItems
  }

  // Listen for order updates
  useEffect(() => {
    const handleOrdersUpdate = (event: CustomEvent) => {
      const updatedOrders = event.detail as Order[]
      const orderSalesItems = convertOrdersToSalesItems(updatedOrders)
      const existingSales = salesItems.filter(item => !item.id.includes('-')) // Keep manually added items
      const mergedSales = [...existingSales, ...orderSalesItems.filter(orderItem => 
        !existingSales.some(existingItem => existingItem.id === orderItem.id)
      )]
      
      setSalesItems(mergedSales)
      saveSalesData(mergedSales)
    }

    window.addEventListener('ordersUpdated', handleOrdersUpdate as EventListener)
    
    return () => {
      window.removeEventListener('ordersUpdated', handleOrdersUpdate as EventListener)
    }
  }, [salesItems])

  // Initial load of sales data
  useEffect(() => {
    const savedSales = localStorage.getItem('salesData')
    let existingSales: SalesItem[] = []
    
    if (savedSales) {
      existingSales = JSON.parse(savedSales)
    }
    
    // Convert orders to sales items and merge with existing data
    const orderSalesItems = convertOrdersToSalesItems(orders)
    const mergedSales = [...existingSales, ...orderSalesItems.filter(orderItem => 
      !existingSales.some(existingItem => existingItem.id === orderItem.id)
    )]
    
    setSalesItems(mergedSales)
    localStorage.setItem('salesData', JSON.stringify(mergedSales))
  }, []) // Only run once on mount

  // Save sales data to localStorage
  const saveSalesData = (data: SalesItem[]) => {
    localStorage.setItem('salesData', JSON.stringify(data))
  }

  // Handle cost per unit change
  const handleCostPerUnitChange = (id: string, costPerUnit: number) => {
    const updatedItems = salesItems.map(item => {
      if (item.id === id) {
        const totalCost = item.quantity * costPerUnit
        const profit = item.salesAmount - totalCost
        return {
          ...item,
          costPerUnit,
          totalCost,
          profit
        }
      }
      return item
    })
    
    setSalesItems(updatedItems)
    saveSalesData(updatedItems)
  }

  // Filter sales items by period
  const getFilteredSalesItems = (): SalesItem[] => {
    let filtered = [...salesItems]

    if (useCustomRange && startDate && endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        return itemDate >= start && itemDate <= end
      })
    } else {
      const now = new Date()
      const filterDate = new Date()
      
      switch (selectedPeriod) {
        case 'current-month':
          filterDate.setMonth(now.getMonth())
          filterDate.setDate(1)
          break
        case 'last-month':
          filterDate.setMonth(now.getMonth() - 1)
          filterDate.setDate(1)
          break
        case 'all-time':
          return filtered
      }

      if (selectedPeriod !== 'all-time') {
        filtered = filtered.filter(item => new Date(item.date) >= filterDate)
      }
    }

    // Sort from latest to earliest
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const filteredSalesItems = getFilteredSalesItems()

  // Calculate totals
  const totalSalesAmount = filteredSalesItems.reduce((sum, item) => sum + item.salesAmount, 0)
  const totalCost = filteredSalesItems.reduce((sum, item) => sum + item.totalCost, 0)
  const totalProfit = filteredSalesItems.reduce((sum, item) => sum + item.profit, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Продажи</h2>
          <p className="text-gray-500 mt-1">Детализация продаж по товарам</p>
        </div>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Период</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button
              variant={selectedPeriod === 'current-month' && !useCustomRange ? 'default' : 'outline'}
              onClick={() => {
                setSelectedPeriod('current-month')
                setUseCustomRange(false)
              }}
            >
              Текущий месяц
            </Button>
            <Button
              variant={selectedPeriod === 'last-month' && !useCustomRange ? 'default' : 'outline'}
              onClick={() => {
                setSelectedPeriod('last-month')
                setUseCustomRange(false)
              }}
            >
              Прошлый месяц
            </Button>
            <Button
              variant={selectedPeriod === 'all-time' && !useCustomRange ? 'default' : 'outline'}
              onClick={() => {
                setSelectedPeriod('all-time')
                setUseCustomRange(false)
              }}
            >
              Все время
            </Button>
            <Button
              variant={useCustomRange ? 'default' : 'outline'}
              onClick={() => setUseCustomRange(true)}
            >
              Выбрать даты
            </Button>
          </div>

          {/* Custom Date Range */}
          {useCustomRange && (
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Label htmlFor="startDate">С:</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="endDate">По:</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setUseCustomRange(false)
                  setStartDate('')
                  setEndDate('')
                }}
              >
                Отмена
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Детализация продаж</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Дата</th>
                  <th className="text-left p-3 font-semibold">Наименование</th>
                  <th className="text-right p-3 font-semibold">Кол-во</th>
                  <th className="text-right p-3 font-semibold">Цена за шт</th>
                  <th className="text-right p-3 font-semibold">Сумма продажи</th>
                  <th className="text-right p-3 font-semibold">Себестоимость, шт</th>
                  <th className="text-right p-3 font-semibold">Сумма себестоимость</th>
                  <th className="text-right p-3 font-semibold">Profit</th>
                </tr>
              </thead>
              <tbody>
                {filteredSalesItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">
                      {new Date(item.date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="p-3 text-sm font-medium">{item.name}</td>
                    <td className="p-3 text-sm text-right">{item.quantity.toFixed(2)}</td>
                    <td className="p-3 text-sm text-right">{item.pricePerUnit.toFixed(2)}</td>
                    <td className="p-3 text-sm text-right font-semibold text-orange-600">
                      {item.salesAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-sm text-right">
                      <Input
                        type="number"
                        value={item.costPerUnit}
                        onChange={(e) => handleCostPerUnitChange(item.id, parseFloat(e.target.value) || 0)}
                        className="w-20 text-right text-sm border border-gray-300 rounded px-2 py-1 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="p-3 text-sm text-right">{item.totalCost.toFixed(2)}</td>
                    <td className="p-3 text-sm text-right font-semibold text-green-600">
                      {item.profit.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="p-3 font-bold" colSpan={4}>Итого:</td>
                  <td className="p-3 text-right font-bold text-orange-600">
                    {totalSalesAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-bold">
                    {filteredSalesItems.length > 0 ? (totalCost / filteredSalesItems.reduce((sum, item) => sum + item.quantity, 0)).toFixed(2) : '0.00'}
                  </td>
                  <td className="p-3 text-right font-bold">
                    {totalCost.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-bold text-green-600">
                    {totalProfit.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
