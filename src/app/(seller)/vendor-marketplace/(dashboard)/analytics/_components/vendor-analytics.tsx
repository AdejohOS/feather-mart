"use client";

import { useState } from "react";
import { format, subDays, isWithinInterval } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface SalesData {
  product_name: string;
  product_price: number;
  quantity: number;
  created_at: string | null;
}

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
}

interface VendorAnalyticsProps {
  farmId: string;
  salesData: SalesData[];
  topProducts: Product[];
}

export const VendorAnalytics = ({
  salesData,
  topProducts,
}: VendorAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState("7days");

  // Filter sales data based on time range
  const filteredSalesData = salesData.filter((sale) => {
    const saleDate = new Date(sale.created_at!);
    const now = new Date();

    switch (timeRange) {
      case "7days":
        return isWithinInterval(saleDate, { start: subDays(now, 7), end: now });
      case "30days":
        return isWithinInterval(saleDate, {
          start: subDays(now, 30),
          end: now,
        });
      case "90days":
        return isWithinInterval(saleDate, {
          start: subDays(now, 90),
          end: now,
        });
      default:
        return true;
    }
  });

  // Calculate total revenue
  const totalRevenue = filteredSalesData.reduce(
    (sum, sale) => sum + sale.product_price * sale.quantity,
    0
  );

  // Calculate total orders
  const totalOrders = new Set(filteredSalesData.map((sale) => sale.created_at))
    .size;

  // Calculate total products sold
  const totalProductsSold = filteredSalesData.reduce(
    (sum, sale) => sum + sale.quantity,
    0
  );

  // Calculate average order value
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Prepare data for daily sales chart
  const dailySalesMap = filteredSalesData.reduce(
    (acc: Record<string, number>, sale) => {
      const date = format(new Date(sale.created_at!), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += sale.product_price * sale.quantity;
      return acc;
    },
    {}
  );

  const dailySalesData = Object.entries(dailySalesMap).map(
    ([date, revenue]) => ({
      date: format(new Date(date), "MMM d"),
      revenue,
    })
  );

  // Sort by date
  dailySalesData.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  // Prepare data for product sales chart
  const productSalesMap = filteredSalesData.reduce(
    (acc: Record<string, number>, sale) => {
      if (!acc[sale.product_name]) {
        acc[sale.product_name] = 0;
      }
      acc[sale.product_name] += sale.quantity;
      return acc;
    },
    {}
  );

  const productSalesData = Object.entries(productSalesMap)
    .map(([name, quantity]) => ({
      name,
      quantity,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === "7days"
                ? "Last 7 days"
                : timeRange === "30days"
                ? "Last 30 days"
                : timeRange === "90days"
                ? "Last 90 days"
                : "All time"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === "7days"
                ? "Last 7 days"
                : timeRange === "30days"
                ? "Last 30 days"
                : timeRange === "90days"
                ? "Last 90 days"
                : "All time"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductsSold}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === "7days"
                ? "Last 7 days"
                : timeRange === "30days"
                ? "Last 30 days"
                : timeRange === "90days"
                ? "Last 90 days"
                : "All time"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {timeRange === "7days"
                ? "Last 7 days"
                : timeRange === "30days"
                ? "Last 30 days"
                : timeRange === "90days"
                ? "Last 90 days"
                : "All time"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4 ">
        <TabsList className="w-full flex-wrap">
          <TabsTrigger value="sales">Sales Overview</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales</CardTitle>
              <CardDescription>
                Your sales performance over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {dailySalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailySalesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">
                    No sales data available for the selected period
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>
                  Products with the highest sales volume
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {productSalesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productSalesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="quantity"
                      >
                        {productSalesData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} units`, "Quantity"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      No product data available for the selected period
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Summary</CardTitle>
                <CardDescription>
                  Breakdown of your sales performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Total Revenue</span>
                      <span className="text-sm font-medium">
                        ${totalRevenue.toFixed(2)}
                      </span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Total Orders</span>
                      <span className="text-sm font-medium">{totalOrders}</span>
                    </div>
                    <Progress
                      value={totalOrders > 0 ? 100 : 0}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Products Sold</span>
                      <span className="text-sm font-medium">
                        {totalProductsSold}
                      </span>
                    </div>
                    <Progress
                      value={totalProductsSold > 0 ? 100 : 0}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Average Order Value
                      </span>
                      <span className="text-sm font-medium">
                        ${averageOrderValue.toFixed(2)}
                      </span>
                    </div>
                    <Progress
                      value={averageOrderValue > 0 ? 100 : 0}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Sales performance by product</CardDescription>
            </CardHeader>
            <CardContent>
              {productSalesData.length > 0 ? (
                <div className="space-y-4">
                  {productSalesData.map((product, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {product.name}
                        </span>
                        <span className="text-sm font-medium">
                          {product.quantity} units
                        </span>
                      </div>
                      <Progress
                        value={
                          (product.quantity /
                            Math.max(
                              ...productSalesData.map((p) => p.quantity)
                            )) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">
                    No product data available for the selected period
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Products with low stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div key={product.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {product.name}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            product.stock === 0
                              ? "text-red-500"
                              : product.stock < 5
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {product.stock} in stock
                        </span>
                      </div>
                      <Progress
                        value={Math.min((product.stock / 20) * 100, 100)}
                        className={`h-2 ${
                          product.stock === 0
                            ? "bg-red-500"
                            : product.stock < 5
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No inventory data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
