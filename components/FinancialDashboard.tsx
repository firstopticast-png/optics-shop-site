'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calculator, DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, CreditCard, Banknote } from 'lucide-react'

interface FinancialData {
  id: string
  date: string
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  paymentMethod: string
  status: 'completed' | 'pending' | 'cancelled'
}

interface FinancialStats {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  monthlyIncome: number
  monthlyExpenses: number
  cashFlow: number
}

export default function FinancialDashboard() {
  const [financialData, setFinancialData] = useState<FinancialData[]>([])
  const [stats, setStats] = useState<FinancialStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    cashFlow: 0
  })
  const [timeFilter, setTimeFilter] = useState('month')
  const [typeFilter, setTypeFilter] = useState('all')


  // Load financial data from localStorage on component mount
  useEffect(() => {
    const savedFinancial = localStorage.getItem('optics-sonata-financial')
    if (savedFinancial) {
      setFinancialData(JSON.parse(savedFinancial))
    } else {
      // Add some sample data
      const sampleFinancial: FinancialData[] = [
        {
          id: '1',
          date: '2024-12-15',
          type: 'income',
          category: 'Продажи очков',
          description: 'Продажа очков клиенту Иван Петров',
          amount: 70000,
          paymentMethod: 'Наличные',
          status: 'completed'
        },
        {
          id: '2',
          date: '2024-12-15',
          type: 'expense',
          category: 'Закупка товаров',
          description: 'Закупка новых оправ от поставщика',
          amount: 25000,
          paymentMethod: 'Перевод',
          status: 'completed'
        },
        {
          id: '3',
          date: '2024-12-14',
          type: 'income',
          category: 'Услуги',
          description: 'Услуга подгонки оправы',
          amount: 5000,
          paymentMethod: 'Карта',
          status: 'completed'
        },
        {
          id: '4',
          date: '2024-12-14',
          type: 'expense',
          category: 'Аренда помещения',
          description: 'Аренда за декабрь 2024',
          amount: 150000,
          paymentMethod: 'Перевод',
          status: 'completed'
        },
        {
          id: '5',
          date: '2024-12-13',
          type: 'income',
          category: 'Продажи линз',
          description: 'Продажа прогрессивных линз',
          amount: 45000,
          paymentMethod: 'Карта',
          status: 'completed'
        },
        {
          id: '6',
          date: '2024-12-13',
          type: 'expense',
          category: 'Зарплата сотрудников',
          description: 'Зарплата за декабрь 2024',
          amount: 200000,
          paymentMethod: 'Перевод',
          status: 'completed'
        }
      ]
      setFinancialData(sampleFinancial)
      localStorage.setItem('optics-sonata-financial', JSON.stringify(sampleFinancial))
    }
  }, [])

  // Calculate stats whenever financial data changes
  useEffect(() => {
    const getFilteredData = () => {
      let filtered = financialData

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
        filtered = filtered.filter(item => new Date(item.date) >= filterDate)
      }

      // Filter by type
      if (typeFilter !== 'all') {
        filtered = filtered.filter(item => item.type === typeFilter)
      }

      return filtered
    }

    const filteredData = getFilteredData()
    const totalIncome = filteredData
      .filter(item => item.type === 'income' && item.status === 'completed')
      .reduce((sum, item) => sum + item.amount, 0)
    
    const totalExpenses = filteredData
      .filter(item => item.type === 'expense' && item.status === 'completed')
      .reduce((sum, item) => sum + item.amount, 0)
    
    const netProfit = totalIncome - totalExpenses
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

    // Calculate monthly data
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthlyData = filteredData.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate.getMonth() === currentMonth && 
             itemDate.getFullYear() === currentYear &&
             item.status === 'completed'
    })
    
    const monthlyIncome = monthlyData
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0)
    
    const monthlyExpenses = monthlyData
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0)
    
    const cashFlow = monthlyIncome - monthlyExpenses

    setStats({
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      monthlyIncome,
      monthlyExpenses,
      cashFlow
    })
  }, [financialData, timeFilter, typeFilter])

  const getFilteredData = () => {
    let filtered = financialData

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
      filtered = filtered.filter(item => new Date(item.date) >= filterDate)
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter)
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

  const getTypeBadge = (type: string) => {
    return type === 'income' 
      ? <Badge variant="default" className="bg-green-600">Доход</Badge>
      : <Badge variant="destructive">Расход</Badge>
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
          <h2 className="text-2xl font-bold text-gray-900">Финансовая панель</h2>
          <p className="text-gray-500 mt-1">Управление финансами и анализ доходов/расходов</p>
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все операции</SelectItem>
              <SelectItem value="income">Доходы</SelectItem>
              <SelectItem value="expense">Расходы</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общие доходы</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              +15% с прошлого периода
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общие расходы</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% с прошлого периода
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Чистая прибыль</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Маржа: {stats.profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Денежный поток</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.cashFlow)}
            </div>
            <p className="text-xs text-muted-foreground">
              За текущий месяц
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Анализ по месяцам</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Доходы за месяц:</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(stats.monthlyIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Расходы за месяц:</span>
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(stats.monthlyExpenses)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Баланс месяца:</span>
              <span className={`text-lg font-bold ${stats.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.cashFlow)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${stats.cashFlow >= 0 ? 'bg-green-600' : 'bg-red-600'}`}
                style={{ width: `${Math.min(Math.abs(stats.cashFlow) / Math.max(stats.monthlyIncome, stats.monthlyExpenses) * 100, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Финансовые показатели</span>
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
              Тип операций: {typeFilter === 'all' ? 'Все' :
                            typeFilter === 'income' ? 'Доходы' : 'Расходы'}
            </div>
            <div className="text-sm text-gray-600">
              Показано операций: {filteredData.length}
            </div>
            <div className="text-sm text-gray-600">
              Рентабельность: {stats.profitMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Финансовые операции</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Способ оплаты</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="flex items-center space-x-2">
                      {transaction.paymentMethod === 'Наличные' ? (
                        <Banknote className="w-4 h-4 text-gray-400" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-gray-400" />
                      )}
                      <span>{transaction.paymentMethod}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
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
