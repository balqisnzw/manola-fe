import { api } from "@/lib/api";

export interface MonthlyData {
  month: string;
  value: number;
}

export interface TopProduct {
  rank: number;
  name: string;
  category: string;
  sold: number;
  revenue: number;
}

export interface LowStockItem {
  id: number;
  productName: string;
  size: string;
  color: string;
  stock: number;
}

export interface DashboardData {
  yearlyTotal: number;
  monthlyTotal: number;
  dailyTotal: number;
  todayOrderCount: number;
  totalProducts: number;
  monthlyData: MonthlyData[];
  topProducts: TopProduct[];
  lowStockProducts: LowStockItem[];
  bestCashier?: { id: number; name: string; totalSales: number; orderCount: number } | null;
  cashierRanking?: { id: number; name: string; totalSales: number; orderCount: number }[];
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const analyticsService = {
  /** GET /analytics/dashboard */
  async getDashboard(): Promise<DashboardData> {
    const res = await api.get<ApiResponse<DashboardData>>("/analytics/dashboard");
    return res.data;
  },
};
