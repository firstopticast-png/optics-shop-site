'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Plus, Trash2, Save, Download } from 'lucide-react'

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

interface SalesDatabaseProps {
  orders: any[] // Orders from OrderForm
}

export default function SalesDatabase({ orders }: SalesDatabaseProps) {
  const [salesItems, setSalesItems] = useState<SalesItem[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('current-month')
  const [editingItem, setEditingItem] = useState<SalesItem | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Load sales data from localStorage
  useEffect(() => {
    const savedSales = localStorage.getItem('salesData')
    if (savedSales) {
      setSalesItems(JSON.parse(savedSales))
    } else {
      // Initialize with sample data based on screenshot
      const sampleData: SalesItem[] = [
        {
          id: '1',
          date: '2025-06-02',
          name: 'Оправа Azzaro',
          quantity: 1,
          pricePerUnit: 90000,
          salesAmount: 90000,
          costPerUnit: 131610,
          totalCost: 131610,
          profit: -41610
        },
        {
          id: '2',
          date: '2025-06-02',
          name: 'Линзы Hoya Work Style Business 1.60 HVLL BLC 4 метра',
          quantity: 1,
          pricePerUnit: 81000,
          salesAmount: 81000,
          costPerUnit: 0,
          totalCost: 0,
          profit: 81000
        },
        {
          id: '3',
          date: '2025-06-03',
          name: 'Air Optix',
          quantity: 2,
          pricePerUnit: 2750,
          salesAmount: 5500,
          costPerUnit: 0,
          totalCost: 0,
          profit: 5500
        },
        {
          id: '4',
          date: '2025-06-04',
          name: 'Оправа Sonata',
          quantity: 1,
          pricePerUnit: 30000,
          salesAmount: 30000,
          costPerUnit: 0,
          totalCost: 0,
          profit: 30000
        },
        {
          id: '5',
          date: '2025-06-06',
          name: 'One Day Dailies Agua Comfort (10700тг)',
          quantity: 1,
          pricePerUnit: 10700,
          salesAmount: 10700,
          costPerUnit: 0,
          totalCost: 0,
          profit: 10700
        },
        {
          id: '6',
          date: '2025-06-07',
          name: 'Ремонт',
          quantity: 1,
          pricePerUnit: 3000,
          salesAmount: 3000,
          costPerUnit: 0,
          totalCost: 0,
          profit: 3000
        },
        {
          id: '7',
          date: '2025-06-07',
          name: 'Оправа RB 3016',
          quantity: 1,
          pricePerUnit: 25000,
          salesAmount: 25000,
          costPerUnit: 0,
          totalCost: 0,
          profit: 25000
        }
      ]
      setSalesItems(sampleData)
      localStorage.setItem('salesData', JSON.stringify(sampleData))
    }
  }, [])

  // Save sales data to localStorage
  const saveSalesData = (data: SalesItem[]) => {
    localStorage.setItem('salesData', JSON.stringify(data))
  }

  // Calculate totals
  const calculateTotals = () => {
    const totalRevenue = salesItems.reduce((sum, item) => sum + item.salesAmount, 0)
    const totalCost = salesItems.reduce((sum, item) => sum + item.totalCost, 0)
    const totalProfit = salesItems.reduce((sum, item) => sum + item.profit, 0)
    
    return { totalRevenue, totalCost, totalProfit }
  }

  // Filter items by selected period
  const getFilteredItems = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    switch (selectedPeriod) {
      case 'current-month':
        return salesItems.filter(item => {
          const itemDate = new Date(item.date)
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
        })
      case 'last-month':
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
        return salesItems.filter(item => {
          const itemDate = new Date(item.date)
          return itemDate.getMonth() === lastMonth && itemDate.getFullYear() === lastMonthYear
        })
      case 'all-time':
        return salesItems
      default:
        return salesItems
    }
  }

  const filteredItems = getFilteredItems()
  const totals = calculateTotals()

  // Handle adding new item
  const handleAddNew = () => {
    const newItem: SalesItem = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      name: '',
      quantity: 1,
      pricePerUnit: 0,
      salesAmount: 0,
      costPerUnit: 0,
      totalCost: 0,
      profit: 0
    }
    setEditingItem(newItem)
    setIsAddingNew(true)
  }

  // Handle editing item
  const handleEdit = (item: SalesItem) => {
    setEditingItem({ ...item })
    setIsAddingNew(false)
  }

  // Handle saving item
  const handleSave = () => {
    if (!editingItem) return

    // Calculate derived values
    const salesAmount = editingItem.quantity * editingItem.pricePerUnit
    const totalCost = editingItem.quantity * editingItem.costPerUnit
    const profit = salesAmount - totalCost

    const updatedItem = {
      ...editingItem,
      salesAmount,
      totalCost,
      profit
    }

    let updatedItems
    if (isAddingNew) {
      updatedItems = [...salesItems, updatedItem]
    } else {
      updatedItems = salesItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    }

    setSalesItems(updatedItems)
    saveSalesData(updatedItems)
    setEditingItem(null)
    setIsAddingNew(false)
  }

  // Handle deleting item
  const handleDelete = (id: string) => {
    const updatedItems = salesItems.filter(item => item.id !== id)
    setSalesItems(updatedItems)
    saveSalesData(updatedItems)
  }

  // Handle input change
  const handleInputChange = (field: keyof SalesItem, value: string | number) => {
    if (!editingItem) return
    setEditingItem({ ...editingItem, [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Продажи</h2>
          <p className="text-gray-500 mt-1">Учет продаж и прибыли</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={handleAddNew} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Добавить</span>
          </Button>
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
        <CardContent>
          <div className="flex space-x-2">
            <Button
              variant={selectedPeriod === 'current-month' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('current-month')}
            >
              Текущий месяц
            </Button>
            <Button
              variant={selectedPeriod === 'last-month' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('last-month')}
            >
              Прошлый месяц
            </Button>
            <Button
              variant={selectedPeriod === 'all-time' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('all-time')}
            >
              Все время
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Таблица продаж</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Дата</TableHead>
                  <TableHead className="min-w-[200px]">Наименование</TableHead>
                  <TableHead className="w-[80px]">Кол-во</TableHead>
                  <TableHead className="w-[120px]">Цена за шт</TableHead>
                  <TableHead className="w-[120px]">Сумма продажи</TableHead>
                  <TableHead className="w-[120px]">Себестоимость, шт</TableHead>
                  <TableHead className="w-[120px]">Сумма себестоимость</TableHead>
                  <TableHead className="w-[120px]">Profit</TableHead>
                  <TableHead className="w-[100px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.date).toLocaleDateString('ru-RU')}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.quantity.toFixed(2)}</TableCell>
                    <TableCell>{item.pricePerUnit.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="font-semibold text-orange-600">
                      {item.salesAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{item.costPerUnit.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{item.totalCost.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className={`font-semibold ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.profit.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          Редактировать
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Totals Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Итого за период</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totals.totalRevenue.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">Общая выручка</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {totals.totalCost.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">Себестоимость</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${totals.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totals.totalProfit.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">Прибыль</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingItem && (
        <Card>
          <CardHeader>
            <CardTitle>{isAddingNew ? 'Добавить запись' : 'Редактировать запись'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Дата</Label>
                <Input
                  id="date"
                  type="date"
                  value={editingItem.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="name">Наименование</Label>
                <Input
                  id="name"
                  value={editingItem.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Название товара/услуги"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Количество</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={editingItem.quantity}
                  onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="pricePerUnit">Цена за шт</Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  step="0.01"
                  value={editingItem.pricePerUnit}
                  onChange={(e) => handleInputChange('pricePerUnit', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costPerUnit">Себестоимость за шт</Label>
                <Input
                  id="costPerUnit"
                  type="number"
                  step="0.01"
                  value={editingItem.costPerUnit}
                  onChange={(e) => handleInputChange('costPerUnit', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSave} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </Button>
              </div>
            </div>

            {/* Calculated Values Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Рассчитанные значения:</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Сумма продажи:</span>
                  <span className="ml-2 font-semibold">
                    {(editingItem.quantity * editingItem.pricePerUnit).toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Сумма себестоимости:</span>
                  <span className="ml-2 font-semibold">
                    {(editingItem.quantity * editingItem.costPerUnit).toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Прибыль:</span>
                  <span className={`ml-2 font-semibold ${(editingItem.quantity * editingItem.pricePerUnit - editingItem.quantity * editingItem.costPerUnit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(editingItem.quantity * editingItem.pricePerUnit - editingItem.quantity * editingItem.costPerUnit).toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
