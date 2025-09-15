'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2, Calculator, TrendingDown, AlertTriangle, Target } from 'lucide-react'
import { toast } from 'sonner'

interface CostItem {
  id: string
  name: string
  category: string
  amount: number
  budget: number
  actualSpent: number
  date: string
  description: string
  supplier: string
  status: 'planned' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface CostStats {
  totalBudget: number
  totalSpent: number
  remainingBudget: number
  budgetUtilization: number
  overBudgetItems: number
  criticalItems: number
}

export default function CostManagement() {
  const [costs, setCosts] = useState<CostItem[]>([])
  const [stats, setStats] = useState<CostStats>({
    totalBudget: 0,
    totalSpent: 0,
    remainingBudget: 0,
    budgetUtilization: 0,
    overBudgetItems: 0,
    criticalItems: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCost, setEditingCost] = useState<CostItem | null>(null)
  const [formData, setFormData] = useState<Partial<CostItem>>({
    name: '',
    category: '',
    amount: 0,
    budget: 0,
    actualSpent: 0,
    date: '',
    description: '',
    supplier: '',
    status: 'planned',
    priority: 'medium'
  })

  const categories = [
    'Закупка товаров',
    'Аренда помещения',
    'Зарплата сотрудников',
    'Коммунальные услуги',
    'Реклама и маркетинг',
    'Оборудование и техника',
    'Налоги и сборы',
    'Обслуживание и ремонт',
    'Обучение персонала',
    'Страхование',
    'Другие расходы'
  ]

  const priorities = [
    { value: 'low', label: 'Низкий', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Средний', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'Высокий', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Критический', color: 'bg-red-100 text-red-800' }
  ]

  const statuses = [
    { value: 'planned', label: 'Запланировано', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'В процессе', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Завершено', color: 'bg-green-100 text-green-800' },
    { value: 'overdue', label: 'Просрочено', color: 'bg-red-100 text-red-800' }
  ]

  // Load costs from localStorage on component mount
  useEffect(() => {
    const savedCosts = localStorage.getItem('optics-sonata-costs')
    if (savedCosts) {
      setCosts(JSON.parse(savedCosts))
    } else {
      // Add some sample data
      const sampleCosts: CostItem[] = [
        {
          id: '1',
          name: 'Закупка новых оправ',
          category: 'Закупка товаров',
          amount: 150000,
          budget: 200000,
          actualSpent: 145000,
          date: '2024-12-15',
          description: 'Закупка оправ от поставщика Luxottica',
          supplier: 'Luxottica',
          status: 'completed',
          priority: 'high'
        },
        {
          id: '2',
          name: 'Аренда помещения',
          category: 'Аренда помещения',
          amount: 150000,
          budget: 150000,
          actualSpent: 150000,
          date: '2024-12-01',
          description: 'Ежемесячная аренда за декабрь 2024',
          supplier: 'ТОО "Арендодатель"',
          status: 'completed',
          priority: 'critical'
        },
        {
          id: '3',
          name: 'Зарплата сотрудников',
          category: 'Зарплата сотрудников',
          amount: 200000,
          budget: 200000,
          actualSpent: 0,
          date: '2024-12-25',
          description: 'Зарплата за декабрь 2024',
          supplier: 'Внутренние расходы',
          status: 'planned',
          priority: 'critical'
        },
        {
          id: '4',
          name: 'Реклама в социальных сетях',
          category: 'Реклама и маркетинг',
          amount: 50000,
          budget: 30000,
          actualSpent: 45000,
          date: '2024-12-20',
          description: 'Рекламная кампания в Instagram и Facebook',
          supplier: 'Meta Platforms',
          status: 'in_progress',
          priority: 'medium'
        },
        {
          id: '5',
          name: 'Обновление оборудования',
          category: 'Оборудование и техника',
          amount: 300000,
          budget: 250000,
          actualSpent: 0,
          date: '2025-01-15',
          description: 'Покупка нового оборудования для диагностики',
          supplier: 'Медицинское оборудование',
          status: 'planned',
          priority: 'high'
        }
      ]
      setCosts(sampleCosts)
      localStorage.setItem('optics-sonata-costs', JSON.stringify(sampleCosts))
    }
  }, [])

  // Calculate stats whenever costs change
  useEffect(() => {
    const totalBudget = costs.reduce((sum, cost) => sum + cost.budget, 0)
    const totalSpent = costs.reduce((sum, cost) => sum + cost.actualSpent, 0)
    const remainingBudget = totalBudget - totalSpent
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    const overBudgetItems = costs.filter(cost => cost.actualSpent > cost.budget).length
    const criticalItems = costs.filter(cost => cost.priority === 'critical').length

    setStats({
      totalBudget,
      totalSpent,
      remainingBudget,
      budgetUtilization,
      overBudgetItems,
      criticalItems
    })
  }, [costs])

  // Save costs to localStorage whenever costs change
  useEffect(() => {
    localStorage.setItem('optics-sonata-costs', JSON.stringify(costs))
  }, [costs])

  const filteredCosts = costs.filter(cost => {
    const matchesSearch = cost.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cost.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cost.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || cost.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || cost.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleAddCost = () => {
    setEditingCost(null)
    setFormData({
      name: '',
      category: '',
      amount: 0,
      budget: 0,
      actualSpent: 0,
      date: '',
      description: '',
      supplier: '',
      status: 'planned',
      priority: 'medium'
    })
    setIsDialogOpen(true)
  }

  const handleEditCost = (cost: CostItem) => {
    setEditingCost(cost)
    setFormData(cost)
    setIsDialogOpen(true)
  }

  const handleSaveCost = () => {
    if (!formData.name || !formData.category || !formData.amount) {
      toast.error('Пожалуйста, заполните обязательные поля')
      return
    }

    const costData: CostItem = {
      id: editingCost?.id || Date.now().toString(),
      name: formData.name!,
      category: formData.category!,
      amount: formData.amount!,
      budget: formData.budget || formData.amount!,
      actualSpent: formData.actualSpent || 0,
      date: formData.date || new Date().toISOString().split('T')[0],
      description: formData.description || '',
      supplier: formData.supplier || '',
      status: formData.status || 'planned',
      priority: formData.priority || 'medium'
    }

    if (editingCost) {
      setCosts(costs.map(c => c.id === editingCost.id ? costData : c))
      toast.success('Расход обновлен')
    } else {
      setCosts([...costs, costData])
      toast.success('Новый расход добавлен')
    }

    setIsDialogOpen(false)
  }

  const handleDeleteCost = (costId: string) => {
    setCosts(costs.filter(c => c.id !== costId))
    toast.success('Расход удален')
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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorities.find(p => p.value === priority)
    return (
      <Badge className={priorityConfig?.color || 'bg-gray-100 text-gray-800'}>
        {priorityConfig?.label || priority}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = statuses.find(s => s.value === status)
    return (
      <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-800'}>
        {statusConfig?.label || status}
      </Badge>
    )
  }

  const getBudgetStatus = (actual: number, budget: number) => {
    if (actual > budget) return { status: 'over', label: 'Превышен', variant: 'destructive' as const }
    if (actual === budget) return { status: 'exact', label: 'Точно', variant: 'secondary' as const }
    return { status: 'under', label: 'В рамках', variant: 'default' as const }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Управление себестоимостью</h2>
          <p className="text-gray-500 mt-1">Контроль расходов и бюджетирование</p>
        </div>
        <Button onClick={handleAddCost} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Добавить расход</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общий бюджет</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              Запланированные расходы
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Потрачено</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              Фактические расходы
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Остаток бюджета</CardTitle>
            <Calculator className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.remainingBudget)}
            </div>
            <p className="text-xs text-muted-foreground">
              Использовано: {stats.budgetUtilization.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Превышения</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.overBudgetItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Критических: {stats.criticalItems}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию, описанию или поставщику..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Costs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Список расходов ({filteredCosts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Бюджет</TableHead>
                  <TableHead>Потрачено</TableHead>
                  <TableHead>Остаток</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Приоритет</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCosts.map((cost) => {
                  const budgetStatus = getBudgetStatus(cost.actualSpent, cost.budget)
                  const remaining = cost.budget - cost.actualSpent
                  return (
                    <TableRow key={cost.id}>
                      <TableCell className="font-medium">{cost.name}</TableCell>
                      <TableCell>{cost.category}</TableCell>
                      <TableCell>{formatCurrency(cost.budget)}</TableCell>
                      <TableCell>{formatCurrency(cost.actualSpent)}</TableCell>
                      <TableCell className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(remaining)}
                      </TableCell>
                      <TableCell>{formatDate(cost.date)}</TableCell>
                      <TableCell>{getPriorityBadge(cost.priority)}</TableCell>
                      <TableCell>{getStatusBadge(cost.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCost(cost)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCost(cost.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Cost Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingCost ? 'Редактировать расход' : 'Добавить новый расход'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Введите название расхода"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Категория *</Label>
              <Select value={formData.category || ''} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Сумма *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount || ''}
                onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Бюджет</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget || ''}
                onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualSpent">Фактически потрачено</Label>
              <Input
                id="actualSpent"
                type="number"
                value={formData.actualSpent || ''}
                onChange={(e) => setFormData({...formData, actualSpent: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Дата</Label>
              <Input
                id="date"
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Приоритет</Label>
              <Select value={formData.priority || 'medium'} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select value={formData.status || 'planned'} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Поставщик</Label>
              <Input
                id="supplier"
                value={formData.supplier || ''}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                placeholder="Введите поставщика"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Описание расхода"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveCost}>
              {editingCost ? 'Обновить' : 'Добавить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
