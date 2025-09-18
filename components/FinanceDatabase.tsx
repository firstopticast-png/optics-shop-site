'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Calendar, Calculator, TrendingUp } from 'lucide-react'

interface FinanceData {
  // Затраты кроме себестоимости товара
  salaryAndTaxes: number
  turnoverPercent: number
  regularGoodsPurchase: number
  rentUtilitiesInternet: number
  targetMarketing: number
  accountant: number
  webcassa: number
  goodsDelivery: number
  kofd: number
  masters: number
  kaspiLLPCommissions: number
  kaspiIECommissions: number
  fuelAndOther: number
  credit: number
  raushan: number
  pb: number
  
  // Calculated values
  totalCostsExcludingCOGS: number
  dailyCosts30Days: number
  
  // Payout calculation
  totalRevenue: number
  costOfGoodsSold: number
  totalNetProfit: number
  fiftyPercent: number
}

interface FinanceDatabaseProps {
  salesData: any[] // Sales data from SalesDatabase
}

export default function FinanceDatabase({ salesData }: FinanceDatabaseProps) {
  const [financeData, setFinanceData] = useState<FinanceData>({
    salaryAndTaxes: 200000,
    turnoverPercent: 110178,
    regularGoodsPurchase: 100000,
    rentUtilitiesInternet: 340000,
    targetMarketing: 300000,
    accountant: 30000,
    webcassa: 3000,
    goodsDelivery: 4600,
    kofd: 1100,
    masters: 50000,
    kaspiLLPCommissions: 0,
    kaspiIECommissions: 66100,
    fuelAndOther: 35000,
    credit: 150000,
    raushan: 30000,
    pb: 20000,
    totalCostsExcludingCOGS: 1439978,
    dailyCosts30Days: 47999.27,
    totalRevenue: 3672600,
    costOfGoodsSold: 1421488,
    totalNetProfit: 811134,
    fiftyPercent: 405567
  })

  const [selectedPeriod, setSelectedPeriod] = useState('current-month')
  const [editingField, setEditingField] = useState<string | null>(null)

  // Load finance data from localStorage
  useEffect(() => {
    const savedFinance = localStorage.getItem('financeData')
    if (savedFinance) {
      setFinanceData(JSON.parse(savedFinance))
    }
  }, [])

  // Save finance data to localStorage
  const saveFinanceData = (data: FinanceData) => {
    localStorage.setItem('financeData', JSON.stringify(data))
  }

  // Calculate derived values
  const calculateDerivedValues = (data: FinanceData) => {
    const totalCostsExcludingCOGS = 
      data.salaryAndTaxes +
      data.turnoverPercent +
      data.regularGoodsPurchase +
      data.rentUtilitiesInternet +
      data.targetMarketing +
      data.accountant +
      data.webcassa +
      data.goodsDelivery +
      data.kofd +
      data.masters +
      data.kaspiLLPCommissions +
      data.kaspiIECommissions +
      data.fuelAndOther +
      data.credit +
      data.raushan +
      data.pb

    const dailyCosts30Days = totalCostsExcludingCOGS / 30

    // Calculate from sales data
    const totalRevenue = salesData.reduce((sum, item) => sum + item.salesAmount, 0)
    const costOfGoodsSold = salesData.reduce((sum, item) => sum + item.totalCost, 0)
    const totalNetProfit = totalRevenue - costOfGoodsSold - totalCostsExcludingCOGS
    const fiftyPercent = totalNetProfit * 0.5

    return {
      ...data,
      totalCostsExcludingCOGS,
      dailyCosts30Days,
      totalRevenue,
      costOfGoodsSold,
      totalNetProfit,
      fiftyPercent
    }
  }

  // Handle input change
  const handleInputChange = (field: keyof FinanceData, value: string) => {
    const numericValue = parseFloat(value) || 0
    const updatedData = { ...financeData, [field]: numericValue }
    const calculatedData = calculateDerivedValues(updatedData)
    setFinanceData(calculatedData)
    saveFinanceData(calculatedData)
  }

  // Handle field edit
  const handleFieldEdit = (field: keyof FinanceData) => {
    setEditingField(field)
  }

  // Handle field save
  const handleFieldSave = () => {
    setEditingField(null)
  }

  // Get filtered sales data by period
  const getFilteredSalesData = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    switch (selectedPeriod) {
      case 'current-month':
        return salesData.filter(item => {
          const itemDate = new Date(item.date)
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
        })
      case 'last-month':
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
        return salesData.filter(item => {
          const itemDate = new Date(item.date)
          return itemDate.getMonth() === lastMonth && itemDate.getFullYear() === lastMonthYear
        })
      case 'all-time':
        return salesData
      default:
        return salesData
    }
  }

  const filteredSalesData = getFilteredSalesData()
  const calculatedData = calculateDerivedValues(financeData)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Финансы</h2>
          <p className="text-gray-500 mt-1">Управление финансами и расчеты</p>
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
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm">зарплата оф и налоги</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'salaryAndTaxes' ? (
                    <Input
                      type="number"
                      value={financeData.salaryAndTaxes}
                      onChange={(e) => handleInputChange('salaryAndTaxes', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleFieldEdit('salaryAndTaxes')}
                    >
                      {financeData.salaryAndTaxes.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm">3% от оборота</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'turnoverPercent' ? (
                    <Input
                      type="number"
                      value={financeData.turnoverPercent}
                      onChange={(e) => handleInputChange('turnoverPercent', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleFieldEdit('turnoverPercent')}
                    >
                      {financeData.turnoverPercent.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm">закуп товара регулярный</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'regularGoodsPurchase' ? (
                    <Input
                      type="number"
                      value={financeData.regularGoodsPurchase}
                      onChange={(e) => handleInputChange('regularGoodsPurchase', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded font-bold"
                      onClick={() => handleFieldEdit('regularGoodsPurchase')}
                    >
                      {financeData.regularGoodsPurchase.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm">аренда, комм и интернет</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'rentUtilitiesInternet' ? (
                    <Input
                      type="number"
                      value={financeData.rentUtilitiesInternet}
                      onChange={(e) => handleInputChange('rentUtilitiesInternet', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleFieldEdit('rentUtilitiesInternet')}
                    >
                      {financeData.rentUtilitiesInternet.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm">таргет</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'targetMarketing' ? (
                    <Input
                      type="number"
                      value={financeData.targetMarketing}
                      onChange={(e) => handleInputChange('targetMarketing', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleFieldEdit('targetMarketing')}
                    >
                      {financeData.targetMarketing.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm">бухгалтер</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'accountant' ? (
                    <Input
                      type="number"
                      value={financeData.accountant}
                      onChange={(e) => handleInputChange('accountant', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleFieldEdit('accountant')}
                    >
                      {financeData.accountant.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm">Webcassa</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'webcassa' ? (
                    <Input
                      type="number"
                      value={financeData.webcassa}
                      onChange={(e) => handleInputChange('webcassa', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleFieldEdit('webcassa')}
                    >
                      {financeData.webcassa.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm">доставки товара</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'goodsDelivery' ? (
                    <Input
                      type="number"
                      value={financeData.goodsDelivery}
                      onChange={(e) => handleInputChange('goodsDelivery', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleFieldEdit('goodsDelivery')}
                    >
                      {financeData.goodsDelivery.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm">КОФД</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'kofd' ? (
                    <Input
                      type="number"
                      value={financeData.kofd}
                      onChange={(e) => handleInputChange('kofd', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleFieldEdit('kofd')}
                    >
                      {financeData.kofd.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm">мастера</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'masters' ? (
                    <Input
                      type="number"
                      value={financeData.masters}
                      onChange={(e) => handleInputChange('masters', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleFieldEdit('masters')}
                    >
                      {financeData.masters.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm">комиссии Каспи ТОО</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'kaspiLLPCommissions' ? (
                    <Input
                      type="number"
                      value={financeData.kaspiLLPCommissions}
                      onChange={(e) => handleInputChange('kaspiLLPCommissions', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleFieldEdit('kaspiLLPCommissions')}
                    >
                      {financeData.kaspiLLPCommissions.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm">комиссии Каспи ИП</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'kaspiIECommissions' ? (
                    <Input
                      type="number"
                      value={financeData.kaspiIECommissions}
                      onChange={(e) => handleInputChange('kaspiIECommissions', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleFieldEdit('kaspiIECommissions')}
                    >
                      {financeData.kaspiIECommissions.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm">бензин и прочее</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'fuelAndOther' ? (
                    <Input
                      type="number"
                      value={financeData.fuelAndOther}
                      onChange={(e) => handleInputChange('fuelAndOther', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleFieldEdit('fuelAndOther')}
                    >
                      {financeData.fuelAndOther.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm">кредит</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'credit' ? (
                    <Input
                      type="number"
                      value={financeData.credit}
                      onChange={(e) => handleInputChange('credit', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleFieldEdit('credit')}
                    >
                      {financeData.credit.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm">Раушан</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'raushan' ? (
                    <Input
                      type="number"
                      value={financeData.raushan}
                      onChange={(e) => handleInputChange('raushan', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleFieldEdit('raushan')}
                    >
                      {financeData.raushan.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm">P.B.</Label>
                <div className="flex items-center space-x-2">
                  {editingField === 'pb' ? (
                    <Input
                      type="number"
                      value={financeData.pb}
                      onChange={(e) => handleInputChange('pb', e.target.value)}
                      onBlur={handleFieldSave}
                      className="w-24 text-right"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => handleFieldEdit('pb')}
                    >
                      {financeData.pb.toLocaleString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">итого затраты кроме себестоимости</Label>
                <span className="font-bold text-lg">
                  {calculatedData.totalCostsExcludingCOGS.toLocaleString('ru-RU')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">затраты в день (30 дней)</Label>
                <span className="font-bold text-lg">
                  {calculatedData.dailyCosts30Days.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
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
                  {calculatedData.totalRevenue.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">себестоимость</Label>
                <span className="font-bold text-lg text-purple-600">
                  {calculatedData.costOfGoodsSold.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">итого затраты кроме себестоимости</Label>
                <span className="font-bold text-lg text-orange-600">
                  {calculatedData.totalCostsExcludingCOGS.toLocaleString('ru-RU')}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">итого чистая прибыль</Label>
                <span className={`font-bold text-lg ${calculatedData.totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculatedData.totalNetProfit.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">50%</Label>
                <span className={`font-bold text-lg ${calculatedData.fiftyPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculatedData.fiftyPercent.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
