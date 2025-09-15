'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { FileText, Users, Package, TrendingUp, Calculator, LogOut } from 'lucide-react'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import LoginForm from '@/components/LoginForm'
import OrderForm from '@/components/OrderForm'
import Image from 'next/image'

function MainApp() {
  const { isAuthenticated, login, logout, error } = useAuth()
  const [activeTab, setActiveTab] = useState('orders')

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} error={error} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                <Image src="/logo-new.png" alt="Оптика Соната" width={32} height={32} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ОПТИКА СОНАТА</h1>
                <p className="text-sm text-gray-500">Система управления</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('ru-RU', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <Button 
                onClick={logout} 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Выход</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Заказы</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Клиенты</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Товары</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Продажи</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center space-x-2">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Финансы</span>
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center space-x-2">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Расходы</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrderForm />
          </TabsContent>

          <TabsContent value="clients">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">База клиентов</h2>
              <p className="text-gray-500 mt-2">Раздел в разработке</p>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">База товаров</h2>
              <p className="text-gray-500 mt-2">Раздел в разработке</p>
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Отчеты по продажам</h2>
              <p className="text-gray-500 mt-2">Раздел в разработке</p>
            </div>
          </TabsContent>

          <TabsContent value="finance">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Финансовая панель</h2>
              <p className="text-gray-500 mt-2">Раздел в разработке</p>
            </div>
          </TabsContent>

          <TabsContent value="costs">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Управление себестоимостью</h2>
              <p className="text-gray-500 mt-2">Раздел в разработке</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}
