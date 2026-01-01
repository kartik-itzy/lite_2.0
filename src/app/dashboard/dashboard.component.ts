import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts';

import { GreetingCardComponent, GreetingCardData } from '../components/ui/greeting-card/greeting-card.component';
import { ChartCardComponent, ChartCardData } from '../components/ui/chart-card/chart-card.component';
import { ProgressCardComponent, ProgressCardData, ProgressItem } from '../components/ui/progress-card/progress-card.component';
import { ListCardComponent, ListCardData, ListItem } from '../components/ui/list-card/list-card.component';
import { DropdownComponent, DropdownData, DropdownOption } from '../components/ui/dropdown/dropdown.component';
import { AuthService, User } from '../shared/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    GreetingCardComponent,
    ChartCardComponent,
    ProgressCardComponent,
    ListCardComponent,
    DropdownComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cashflowChart', { static: false }) cashflowChartRef!: ElementRef;
  @ViewChild('expensesChart', { static: false }) expensesChartRef!: ElementRef;
  @ViewChild('incomeExpenseChart', { static: false }) incomeExpenseChartRef!: ElementRef;

  private cashflowChart?: echarts.ECharts;
  private expensesChart?: echarts.ECharts;
  private incomeExpenseChart?: echarts.ECharts;

  currentUser: User | null = null;
  userPermissions: any = null;

  greetingData: GreetingCardData = {
    title: 'Good morning, User!',
    subtitle: 'Welcome back to your dashboard',
    userName: 'User',
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
  };

  cashflowData: ChartCardData = {
    title: 'Cashflow',
    subtitle: 'Monthly cashflow overview',
    total: '$13,232',
    period: 'Last 12 month',
    showPeriodSelector: true,
    periodOptions: ['Last 6 months', 'Last 12 month', 'This year'],
    selectedPeriod: 'Last 12 month'
  };

  incomeExpenseData: ChartCardData = {
    title: 'Income & Expense',
    subtitle: 'Monthly income vs expenses',
    total: '$1,412',
    period: 'Last 6 months',
    showPeriodSelector: true,
    periodOptions: ['Last 3 months', 'Last 6 months', 'This year'],
    selectedPeriod: 'Last 6 months'
  };

  stockData: ProgressCardData = {
    title: 'Stock Availability',
    subtitle: 'Inventory levels overview',
    items: [
      { label: 'Available', value: 309, color: 'bg-blue-500', percentage: 70 },
      { label: 'Low Stock', value: 88, color: 'bg-orange-500', percentage: 20 },
      { label: 'Out of Stock', value: 45, color: 'bg-red-500', percentage: 10 }
    ],
    showLegend: true,
    showPercentages: true,
    total: 442
  };

  productsData: ListCardData = {
    title: 'Popular Products',
    subtitle: 'Best selling items',
    items: [
      {
        id: '1',
        label: 'Electronics',
        value: '4.7 ★',
        subtitle: 'Smart devices & gadgets',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        action: { label: 'Order', color: 'text-blue-600' }
      },
      {
        id: '2',
        label: 'Clothing',
        value: '4.4 ★',
        subtitle: 'Fashion & accessories',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        action: { label: 'Order', color: 'text-blue-600' }
      },
      {
        id: '3',
        label: 'Home & Garden',
        value: '4.6 ★',
        subtitle: 'Household essentials',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        action: { label: 'Order', color: 'text-blue-600' }
      }
    ],
    showHeader: true,
    showFooter: false
  };

  expensesDropdownData: DropdownData = {
    options: [
      { value: 'last_6_months', label: 'Last 6 months' },
      { value: 'last_3_months', label: 'Last 3 months' },
      { value: 'this_year', label: 'This year' }
    ],
    selectedValue: 'last_6_months'
  };

  customersDropdownData: DropdownData = {
    options: [
      { value: 'this_month', label: 'This month' },
      { value: 'last_month', label: 'Last month' },
      { value: 'last_3_months', label: 'Last 3 months' },
      { value: 'this_year', label: 'This year' }
    ],
    selectedValue: 'this_month'
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.userPermissions = this.authService.getUserPermissions();
    
    if (this.currentUser) {
      this.updateGreetingData();
    }
  }

  private updateGreetingData(): void {
    if (this.currentUser) {
      this.greetingData = {
        ...this.greetingData,
        title: `Good morning, ${this.currentUser.name || 'User'}!`,
        userName: this.currentUser.name || 'User',
        subtitle: `Welcome back to ${this.currentUser.company || 'your'} dashboard`
      };
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createCashflowChart();
      this.createExpensesChart();
      this.createIncomeExpenseChart();
      
      window.addEventListener('resize', () => {
        this.cashflowChart?.resize();
        this.expensesChart?.resize();
        this.incomeExpenseChart?.resize();
      });
    }, 100);
  }

  onProductAction(item: ListItem): void {
  }

  onExpensesPeriodChange(value: string): void {
  }

  onCustomersPeriodChange(value: string): void {
  }

  private createCashflowChart() {
    try {
      if (!this.cashflowChartRef?.nativeElement) {
        return;
      }

      this.cashflowChart = echarts.init(this.cashflowChartRef.nativeElement);
      
      const option: any = {
        grid: {
          top: 10,
          right: 20,
          bottom: 30,
          left: 40,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JA'],
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#6B7280',
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          show: true,
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#6B7280',
            fontSize: 10,
            formatter: function(value: number) {
              if (value >= 1000) {
                return (value / 1000) + 'K';
              }
              return value.toString();
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#E5E7EB',
              type: 'dashed'
            }
          },
          min: 1000,
          max: 7000,
          interval: 1000
        },
        series: [
          {
            data: [2000, 1800, 2200, 2500, 2800, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500],
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              color: '#3B82F6',
              width: 3
            },
            itemStyle: {
              color: '#3B82F6',
              borderColor: '#ffffff',
              borderWidth: 2
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                  { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
                ]
              }
            }
          }
        ],
        tooltip: {
          trigger: 'axis',
          formatter: 'Total: $710,897',
          backgroundColor: '#1F2937',
          borderColor: '#1F2937',
          textStyle: {
            color: '#ffffff'
          }
        }
      };

      this.cashflowChart.setOption(option);
    } catch (error) {
      // Handle chart creation error
    }
  }

  private createExpensesChart() {
    try {
      if (!this.expensesChartRef?.nativeElement) {
        return;
      }

      this.expensesChart = echarts.init(this.expensesChartRef.nativeElement);
      
      const option: any = {
        series: [
          {
            type: 'pie',
            radius: ['45%', '65%'],
            center: ['50%', '50%'],
            data: [
              { value: 45, name: 'Internet', itemStyle: { color: '#8B5CF6' } },
              { value: 26, name: 'Electricity', itemStyle: { color: '#4ADE80' } },
              { value: 22, name: 'Transactions', itemStyle: { color: '#60A5FA' } },
              { value: 8, name: 'Rental Cost', itemStyle: { color: '#EF4444' } },
              { value: 3, name: 'Foods', itemStyle: { color: '#F97316' } },
              { value: 2, name: 'Other', itemStyle: { color: '#FBBF24' } }
            ],
            label: {
              show: false
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };

      this.expensesChart.setOption(option);
      
      setTimeout(() => {
        this.expensesChart?.resize();
      }, 50);
    } catch (error) {
    }
  }

  private createIncomeExpenseChart() {
    try {
      if (!this.incomeExpenseChartRef?.nativeElement) {
        return;
      }

      this.incomeExpenseChart = echarts.init(this.incomeExpenseChartRef.nativeElement);
      
      const option: any = {
        grid: {
          top: 10,
          right: 10,
          bottom: 20,
          left: 10,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'],
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#6B7280',
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          show: false
        },
        series: [
          {
            name: 'Income',
            type: 'bar',
            data: [1200, 1400, 1600, 1800, 2000, 2200],
            itemStyle: {
              color: '#10B981',
              borderRadius: [4, 4, 0, 0]
            },
            barWidth: '60%'
          },
          {
            name: 'Expenses',
            type: 'bar',
            data: [800, 900, 1000, 1100, 1200, 1300],
            itemStyle: {
              color: '#F59E0B',
              borderRadius: [4, 4, 0, 0]
            },
            barWidth: '60%'
          }
        ],
        legend: {
          show: false
        }
      };

      this.incomeExpenseChart.setOption(option);
    } catch (error) {
    }
  }

  ngOnDestroy() {
    this.cashflowChart?.dispose();
    this.expensesChart?.dispose();
    this.incomeExpenseChart?.dispose();
  }
} 