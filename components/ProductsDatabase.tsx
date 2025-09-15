'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Edit, Trash2, Package, DollarSign, Hash } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  category: string
  brand: string
  model: string
  type: 'frame' | 'lens' | 'accessory' | 'service'
  price: number
  cost: number
  stock: number
  minStock: number
  sku: string
  description: string
  supplier: string
  createdAt: string
  updatedAt: string
}

export default function ProductsDatabase() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    brand: '',
    model: '',
    type: 'frame',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    sku: '',
    description: '',
    supplier: ''
  })

  const categories = [
    'Оправы',
    'Линзы',
    'Солнцезащитные очки',
    'Аксессуары',
    'Услуги',
    'Запасные части'
  ]

  const types = [
    { value: 'frame', label: 'Оправы' },
    { value: 'lens', label: 'Линзы' },
    { value: 'accessory', label: 'Аксессуары' },
    { value: 'service', label: 'Услуги' }
  ]

  // Load products from localStorage on component mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('optics-sonata-products')
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    } else {
      // Add some sample data
      const sampleProducts: Product[] = [
        {
          id: '1',
          name: 'Оправы Ray-Ban Aviator',
          category: 'Оправы',
          brand: 'Ray-Ban',
          model: 'RB3025',
          type: 'frame',
          price: 25000,
          cost: 15000,
          stock: 15,
          minStock: 5,
          sku: 'RB-3025-001',
          description: 'Классические авиаторские очки с металлической оправой',
          supplier: 'Luxottica',
          createdAt: '2024-01-15',
          updatedAt: '2024-12-15'
        },
        {
          id: '2',
          name: 'Прогрессивные линзы Essilor',
          category: 'Линзы',
          brand: 'Essilor',
          model: 'Varilux Comfort',
          type: 'lens',
          price: 45000,
          cost: 30000,
          stock: 8,
          minStock: 3,
          sku: 'ES-VC-001',
          description: 'Высококачественные прогрессивные линзы',
          supplier: 'Essilor',
          createdAt: '2024-02-20',
          updatedAt: '2024-12-10'
        },
        {
          id: '3',
          name: 'Футляр для очков',
          category: 'Аксессуары',
          brand: 'Generic',
          model: 'Soft Case',
          type: 'accessory',
          price: 3000,
          cost: 1500,
          stock: 50,
          minStock: 20,
          sku: 'ACC-CASE-001',
          description: 'Мягкий футляр для защиты очков',
          supplier: 'Local Supplier',
          createdAt: '2024-03-10',
          updatedAt: '2024-12-05'
        },
        {
          id: '4',
          name: 'Услуга подгонки оправы',
          category: 'Услуги',
          brand: 'In-house',
          model: 'Fitting Service',
          type: 'service',
          price: 5000,
          cost: 2000,
          stock: 999,
          minStock: 0,
          sku: 'SRV-FIT-001',
          description: 'Профессиональная подгонка оправы под клиента',
          supplier: 'Internal',
          createdAt: '2024-01-01',
          updatedAt: '2024-12-15'
        }
      ]
      setProducts(sampleProducts)
      localStorage.setItem('optics-sonata-products', JSON.stringify(sampleProducts))
    }
  }, [])

  // Save products to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('optics-sonata-products', JSON.stringify(products))
  }, [products])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAddProduct = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      category: '',
      brand: '',
      model: '',
      type: 'frame',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 0,
      sku: '',
      description: '',
      supplier: ''
    })
    setIsDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData(product)
    setIsDialogOpen(true)
  }

  const handleSaveProduct = () => {
    if (!formData.name || !formData.category || !formData.brand) {
      toast.error('Пожалуйста, заполните обязательные поля')
      return
    }

    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name!,
      category: formData.category!,
      brand: formData.brand!,
      model: formData.model || '',
      type: formData.type || 'frame',
      price: formData.price || 0,
      cost: formData.cost || 0,
      stock: formData.stock || 0,
      minStock: formData.minStock || 0,
      sku: formData.sku || '',
      description: formData.description || '',
      supplier: formData.supplier || '',
      createdAt: editingProduct?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? productData : p))
      toast.success('Товар обновлен')
    } else {
      setProducts([...products, productData])
      toast.success('Новый товар добавлен')
    }

    setIsDialogOpen(false)
  }

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId))
    toast.success('Товар удален')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { status: 'out', label: 'Нет в наличии', variant: 'destructive' as const }
    if (stock <= minStock) return { status: 'low', label: 'Мало', variant: 'secondary' as const }
    return { status: 'good', label: 'В наличии', variant: 'default' as const }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">База товаров</h2>
          <p className="text-gray-500 mt-1">Управление товарами и услугами</p>
        </div>
        <Button onClick={handleAddProduct} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Добавить товар</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию, бренду или SKU..."
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
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Список товаров ({filteredProducts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Бренд</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Себестоимость</TableHead>
                  <TableHead>Остаток</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.minStock)
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-sm">{product.sku}</span>
                      </TableCell>
                      <TableCell className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>{formatCurrency(product.price)}</span>
                      </TableCell>
                      <TableCell>{formatCurrency(product.cost)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
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

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Редактировать товар' : 'Добавить новый товар'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Введите название товара"
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
              <Label htmlFor="brand">Бренд *</Label>
              <Input
                id="brand"
                value={formData.brand || ''}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                placeholder="Введите бренд"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Модель</Label>
              <Input
                id="model"
                value={formData.model || ''}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                placeholder="Введите модель"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Тип</Label>
              <Select value={formData.type || 'frame'} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku || ''}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                placeholder="Введите SKU"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Цена продажи</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Себестоимость</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost || ''}
                onChange={(e) => setFormData({...formData, cost: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Остаток на складе</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock || ''}
                onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Минимальный остаток</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock || ''}
                onChange={(e) => setFormData({...formData, minStock: Number(e.target.value)})}
                placeholder="0"
              />
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
                placeholder="Описание товара"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveProduct}>
              {editingProduct ? 'Обновить' : 'Добавить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
