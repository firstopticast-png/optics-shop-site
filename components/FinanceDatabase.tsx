'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Calendar, Calculator, TrendingUp, Plus, Trash2, Edit, Save, X } from 'lucide-react'

interface ExpenseItem {
  id: string
  name: string
  amount: number
}

interface FinanceData {
  expenses: ExpenseItem[]
  totalCostsExcludingCOGS: number
  dailyCosts30Days: number
  
  // Payout calculation
  totalRevenue: number
  costOfGoodsSold: number
  totalNetProfit: number
  fiftyPercent: number
}

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

interface FinanceDatabaseProps {
  salesData: SalesItem[]
}

export default function FinanceDatabase({ salesData }: FinanceDatabaseProps) {
  const [financeData, setFinanceData] = useState<FinanceData>({
    expenses: [
      { id: '1', name: 'зарплата оф и налоги', amount: 200000 },
      { id: '2', name: '3% от оборота', amount: 110178 },
      { id: '3', name: 'закуп товара регулярный', amount: 100000 },
      { id: '4', name: 'аренда, комм и интернет', amount: 340000 },
      { id: '5', name: 'таргет', amount: 300000 },
      { id: '6', name: 'бухгалтер', amount: 30000 },
      { id: '7', name: 'Webcassa', amount: 0 },
      { id: '8', name: 'доставки товара', amount: 4600 },
      { id: '9', name: 'КОФД', amount: 1100 },
      { id: '10', name: 'мастера', amount: 50000 },
      { id: '11', name: 'комиссии Каспи ТОО', amount: 0 },
      { id: '12', name: 'комиссии Каспи ИП', amount: 66100 },
      { id: '13', name: 'бензин и прочее', amount: 35000 },
      { id: '14', name: 'кредит', amount: 150000 },
      { id: '15', name: 'Раушан', amount: 30000 },
      { id: '16', name: 'P.B.', amount: 20000 }
    ],
    totalCostsExcludingCOGS: 1439978,
    dailyCosts30Days: 47999.27,
    totalRevenue: 3672600,
    costOfGoodsSold: 1421488,
    totalNetProfit: 811134,
    fiftyPercent: 405567
  })

  const [selectedPeriod, setSelectedPeriod] = useState('current-month')
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newExpenseName, setNewExpenseName] = useState('')
  const [newExpenseAmount, setNewExpenseAmount] = useState(0)

  // Load finance data from localStorage
  useEffect(() => {
    const savedFinance = localStorage.getItem('financeData')
    if (savedFinance) {
      setFinanceData(JSON.parse(savedFinance))
    }
  }, [])

  // Recalculate values when salesData changes
  useEffect(() => {
    const calculatedValues = calculateDerivedValues(financeData.expenses)
    const updatedData = {
      ...financeData,
      ...calculatedValues
    }
    setFinanceData(updatedData)
  }, [salesData])

  // Save finance data to localStorage
  const saveFinanceData = (data: FinanceData) => {
    localStorage.setItem('financeData', JSON.stringify(data))
  }

  // Calculate derived values
  const calculateDerivedValues = (expenses: ExpenseItem[]) => {
    const totalCostsExcludingCOGS = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const dailyCosts30Days = totalCostsExcludingCOGS / 30

    // Calculate from actual sales data
    const totalRevenue = salesData.reduce((sum, item) => sum + item.salesAmount, 0)
    const costOfGoodsSold = salesData.reduce((sum, item) => sum + item.totalCost, 0)
    const totalNetProfit = totalRevenue - costOfGoodsSold - totalCostsExcludingCOGS
    const fiftyPercent = totalNetProfit * 0.5

    return {
      totalCostsExcludingCOGS,
      dailyCosts30Days,
      totalRevenue,
      costOfGoodsSold,
      totalNetProfit,
      fiftyPercent
    }
  }

  // Handle expense amount change
  const handleExpenseAmountChange = (id: string, amount: number) => {
    const updatedExpenses = financeData.expenses.map(expense =>
      expense.id === id ? { ...expense, amount } : expense
    )
    
    const calculatedValues = calculateDerivedValues(updatedExpenses)
    const updatedData = {
      ...financeData,
      expenses: updatedExpenses,
      ...calculatedValues
    }
    
    setFinanceData(updatedData)
    saveFinanceData(updatedData)
  }

  // Handle expense name change
  const handleExpenseNameChange = (id: string, name: string) => {
    const updatedExpenses = financeData.expenses.map(expense =>
      expense.id === id ? { ...expense, name } : expense
    )
    
    const updatedData = { ...financeData, expenses: updatedExpenses }
    setFinanceData(updatedData)
    saveFinanceData(updatedData)
  }

  // Handle adding new expense
  const handleAddExpense = () => {
    if (!newExpenseName.trim()) {
      alert('Пожалуйста, введите название расхода')
      return
    }

    // Check for duplicate names
    const existingExpense = financeData.expenses.find(expense => 
      expense.name.toLowerCase() === newExpenseName.trim().toLowerCase()
    )
    
    if (existingExpense) {
      alert(`Расход с названием "${newExpenseName.trim()}" уже существует. Пожалуйста, выберите другое название.`)
      return
    }

    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      name: newExpenseName.trim(),
      amount: newExpenseAmount
    }

    const updatedExpenses = [...financeData.expenses, newExpense]
    const calculatedValues = calculateDerivedValues(updatedExpenses)
    
    const updatedData = {
      ...financeData,
      expenses: updatedExpenses,
      ...calculatedValues
    }
    
    setFinanceData(updatedData)
    saveFinanceData(updatedData)
    
    // Show success message
    alert(`Расход "${newExpenseName.trim()}" успешно добавлен!`)
    
    // Reset form
    setNewExpenseName('')
    setNewExpenseAmount(0)
    setIsAddingNew(false)
  }

  // Handle deleting expense
  const handleDeleteExpense = (id: string) => {
    const expense = financeData.expenses.find(e => e.id === id)
    const expenseName = expense?.name || 'этот расход'
    
    if (confirm(`Вы уверены, что хотите удалить "${expenseName}"?\n\nЭто действие нельзя отменить.`)) {
      const updatedExpenses = financeData.expenses.filter(expense => expense.id !== id)
      const calculatedValues = calculateDerivedValues(updatedExpenses)
      
      const updatedData = {
        ...financeData,
        expenses: updatedExpenses,
        ...calculatedValues
      }
      
      setFinanceData(updatedData)
      saveFinanceData(updatedData)
      
      // Show success message
      alert(`Расход "${expenseName}" успешно удален!`)
    }
  }

  // Handle editing expense
  const handleEditExpense = (expense: ExpenseItem) => {
    setEditingExpense(expense)
  }

  // Handle saving edited expense
  const handleSaveExpense = () => {
    if (!editingExpense) return
    
    const updatedExpenses = financeData.expenses.map(expense =>
      expense.id === editingExpense.id ? editingExpense : expense
    )
    
    const calculatedValues = calculateDerivedValues(updatedExpenses)
    const updatedData = {
      ...financeData,
      expenses: updatedExpenses,
      ...calculatedValues
    }
    
    setFinanceData(updatedData)
    saveFinanceData(updatedData)
    setEditingExpense(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Финансы</h2>
          <p className="text-gray-500 mt-1">Управление финансами и расчеты</p>
        </div>
        <Button 
          onClick={() => setIsAddingNew(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить расход</span>
        </Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Section - Затраты кроме себестоимости товара */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="w-5 h-5" />
              <span>Затраты кроме себестоимости товара</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {financeData.expenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    {editingExpense?.id === expense.id ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={editingExpense.name}
                          onChange={(e) => setEditingExpense({ ...editingExpense, name: e.target.value })}
                          className="text-sm flex-1"
                          onBlur={handleSaveExpense}
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveExpense()}
                          autoFocus
                          placeholder="Название расхода"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSaveExpense}
                          className="px-2"
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingExpense(null)}
                          className="px-2"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span 
                          className="text-sm cursor-pointer hover:bg-gray-200 px-2 py-1 rounded flex-1"
                          onClick={() => handleEditExpense(expense)}
                          title="Нажмите для редактирования названия"
                        >
                          {expense.name}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditExpense(expense)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity px-2"
                          title="Редактировать название"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={expense.amount}
                      onChange={(e) => handleExpenseAmountChange(expense.id, parseFloat(e.target.value) || 0)}
                      className="w-24 text-right text-sm border border-gray-300 rounded px-2 py-1"
                      step="0.01"
                      min="0"
                      placeholder="0"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-2"
                      title="Удалить расход"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Expense Form */}
            {isAddingNew && (
              <div className="border-t pt-4 space-y-3 bg-blue-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-2">Добавить новый расход:</div>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Введите название расхода"
                    value={newExpenseName}
                    onChange={(e) => setNewExpenseName(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddExpense()}
                    autoFocus
                  />
                  <Input
                    type="number"
                    placeholder="Сумма"
                    value={newExpenseAmount || ''}
                    onChange={(e) => setNewExpenseAmount(parseFloat(e.target.value) || 0)}
                    className="w-32"
                    step="0.01"
                    min="0"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddExpense()}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleAddExpense}
                    disabled={!newExpenseName.trim()}
                    className="px-3"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Сохранить
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingNew(false)
                      setNewExpenseName('')
                      setNewExpenseAmount(0)
                    }}
                    className="px-3"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Отмена
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">итого затраты кроме себестоимости</Label>
                <span className="font-bold text-lg">
                  {financeData.totalCostsExcludingCOGS.toLocaleString('ru-RU')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">затраты в день (30 дней)</Label>
                <span className="font-bold text-lg">
                  {financeData.dailyCosts30Days.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Section - для расчета выплат */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>для расчета выплат:</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">итого выручка</Label>
                <span className="font-bold text-lg text-blue-600">
                  {financeData.totalRevenue.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">себестоимость</Label>
                <span className="font-bold text-lg text-purple-600">
                  {financeData.costOfGoodsSold.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">итого затраты кроме себестоимости</Label>
                <span className="font-bold text-lg text-orange-600">
                  {financeData.totalCostsExcludingCOGS.toLocaleString('ru-RU')}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">итого чистая прибыль</Label>
                <span className={`font-bold text-lg ${financeData.totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financeData.totalNetProfit.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">50%</Label>
                <span className={`font-bold text-lg ${financeData.fiftyPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financeData.fiftyPercent.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
