'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { FileText, Users, Package, TrendingUp, Calculator, LogOut, History } from 'lucide-react'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import LoginForm from '@/components/LoginForm'
import OrderForm from '@/components/OrderForm'
import OrderHistory from '@/components/OrderHistory'
import ClientsDatabase from '@/components/ClientsDatabase'
import ProductsDatabase from '@/components/ProductsDatabase'
import SalesReports from '@/components/SalesReports'
import FinancialDashboard from '@/components/FinancialDashboard'
import CostManagement from '@/components/CostManagement'
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
                <Image src="/logo-round.png" alt="Оптика Соната" width={32} height={32} />
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Новый заказ</span>
            </TabsTrigger>
            <TabsTrigger value="order-history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">История заказов</span>
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

          <TabsContent value="order-history">
            <OrderHistory />
          </TabsContent>

          <TabsContent value="clients">
            <ClientsDatabase />
          </TabsContent>

          <TabsContent value="products">
            <ProductsDatabase />
          </TabsContent>

          <TabsContent value="sales">
            <SalesReports />
          </TabsContent>

          <TabsContent value="finance">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="costs">
            <CostManagement />
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
