'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface Client {
  id: string
  name: string
  phone: string
  email: string
  address: string
  birthDate: string
  registrationDate: string
  totalOrders: number
  totalSpent: number
  lastVisit: string
  notes: string
}

export default function ClientsDatabase() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    birthDate: '',
    notes: ''
  })

  // Load clients from localStorage on component mount
  useEffect(() => {
    const savedClients = localStorage.getItem('optics-sonata-clients')
    if (savedClients) {
      setClients(JSON.parse(savedClients))
    } else {
      // Add some sample data
      const sampleClients: Client[] = [
        {
          id: '1',
          name: 'Иван Петров',
          phone: '+7 (727) 123-45-67',
          email: 'ivan.petrov@email.com',
          address: 'ул. Абая 150, Алматы',
          birthDate: '1985-03-15',
          registrationDate: '2024-01-15',
          totalOrders: 3,
          totalSpent: 45000,
          lastVisit: '2024-12-10',
          notes: 'Предпочитает прогрессивные линзы'
        },
        {
          id: '2',
          name: 'Мария Сидорова',
          phone: '+7 (727) 234-56-78',
          email: 'maria.sidorova@email.com',
          address: 'пр. Достык 200, Алматы',
          birthDate: '1990-07-22',
          registrationDate: '2024-02-20',
          totalOrders: 2,
          totalSpent: 32000,
          lastVisit: '2024-11-28',
          notes: 'Аллергия на некоторые материалы оправ'
        },
        {
          id: '3',
          name: 'Алексей Козлов',
          phone: '+7 (727) 345-67-89',
          email: 'alexey.kozlov@email.com',
          address: 'ул. Сатпаева 75, Алматы',
          birthDate: '1978-11-08',
          registrationDate: '2024-03-10',
          totalOrders: 5,
          totalSpent: 78000,
          lastVisit: '2024-12-15',
          notes: 'Постоянный клиент, VIP статус'
        }
      ]
      setClients(sampleClients)
      localStorage.setItem('optics-sonata-clients', JSON.stringify(sampleClients))
    }
  }, [])

  // Save clients to localStorage whenever clients change
  useEffect(() => {
    localStorage.setItem('optics-sonata-clients', JSON.stringify(clients))
  }, [clients])

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddClient = () => {
    setEditingClient(null)
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      birthDate: '',
      notes: ''
    })
    setIsDialogOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setFormData(client)
    setIsDialogOpen(true)
  }

  const handleSaveClient = () => {
    if (!formData.name || !formData.phone) {
      toast.error('Пожалуйста, заполните обязательные поля')
      return
    }

    const clientData: Client = {
      id: editingClient?.id || Date.now().toString(),
      name: formData.name!,
      phone: formData.phone!,
      email: formData.email || '',
      address: formData.address || '',
      birthDate: formData.birthDate || '',
      registrationDate: editingClient?.registrationDate || new Date().toISOString().split('T')[0],
      totalOrders: editingClient?.totalOrders || 0,
      totalSpent: editingClient?.totalSpent || 0,
      lastVisit: editingClient?.lastVisit || new Date().toISOString().split('T')[0],
      notes: formData.notes || ''
    }

    if (editingClient) {
      setClients(clients.map(c => c.id === editingClient.id ? clientData : c))
      toast.success('Клиент обновлен')
    } else {
      setClients([...clients, clientData])
      toast.success('Новый клиент добавлен')
    }

    setIsDialogOpen(false)
  }

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter(c => c.id !== clientId))
    toast.success('Клиент удален')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">База клиентов</h2>
          <p className="text-gray-500 mt-1">Управление клиентской базой</p>
        </div>
        <Button onClick={handleAddClient} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Добавить клиента</span>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск по имени, телефону или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Список клиентов ({filteredClients.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Заказов</TableHead>
                  <TableHead>Потрачено</TableHead>
                  <TableHead>Последний визит</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{client.phone}</span>
                    </TableCell>
                    <TableCell className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{client.email || 'Не указан'}</span>
                    </TableCell>
                    <TableCell>{client.totalOrders}</TableCell>
                    <TableCell>{formatCurrency(client.totalSpent)}</TableCell>
                    <TableCell className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(client.lastVisit)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.totalSpent > 50000 ? "default" : "secondary"}>
                        {client.totalSpent > 50000 ? 'VIP' : 'Обычный'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClient(client)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClient(client.id)}
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

      {/* Add/Edit Client Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Редактировать клиента' : 'Добавить нового клиента'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Введите имя клиента"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон *</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+7 (727) 123-45-67"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="client@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Дата рождения</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate || ''}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Введите адрес клиента"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Заметки</Label>
              <Input
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Дополнительная информация о клиенте"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveClient}>
              {editingClient ? 'Обновить' : 'Добавить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
