import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { 
  UserCircle, 
  Building2, 
  Briefcase, 
  CircleDot,
  DollarSign,
  TrendingUp,
  Receipt,
  TrendingDown,
  LineChart,
  PieChart
} from 'lucide-react';


interface UserMetaDataProps {
  name: string;
}

interface UserDashboardProps {
  user: {
    name: string;
    email: string;
    user_metadata: UserMetaDataProps;
  };
  selectedBusiness: {
    name: string;
    industry: string;
    type: string;
  };
  monthlyStats: {
    revenue: number;
    expenses: number;
    netProfit: number;
    profitMargin: number;
  };
}

const UserDashboard: React.FC<UserDashboardProps> = ({ 
  user, 
  selectedBusiness, 
  monthlyStats 
}) => {
  console.log('UserDashboard components user', user);

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-50/50 to-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Enhanced Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-xl p-8 border border-navy-200 shadow-lg relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute right-0 top-0 w-96 h-96 bg-navy-500 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute left-0 bottom-0 w-64 h-64 bg-navy-500 rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            
            <div className="space-y-2 relative">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-navy-600 to-navy-400 flex items-center justify-center shadow-inner">
                  <UserCircle className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-navy-900">
                  Welcome, {user?.user_metadata?.name || 'Guest'}
                </h1>
              </div>
              <p className="text-navy-600 text-lg">
                Client User Dashboard
              </p>
            </div>
            
            {/* Business Selection Section */}
            <div className="mt-6 md:mt-0 flex flex-col md:items-end relative">
              <div className="bg-gradient-to-br from-navy-50 to-white rounded-xl p-4 border border-navy-200 shadow-md">
                <div className="text-sm font-medium text-navy-700 mb-2 flex items-center gap-2">
                  <CircleDot className="h-4 w-4 text-green-500" />
                  Active Business
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-navy-600 to-navy-400 rounded-xl flex items-center justify-center shadow-sm">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 text-lg">
                      {selectedBusiness?.name || 'No business selected'}
                    </div>
                    <div className="text-sm text-navy-600 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {selectedBusiness?.type || 'Select a business to continue'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-navy-600 to-navy-500 border-none shadow-xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-navy-50">
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(monthlyStats.revenue)}
                </div>
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20">
                  <TrendingUp className="h-4 w-4 text-emerald-300" />
                  <span className="text-emerald-300 font-medium">+12.5%</span>
                </div>
                <span className="text-navy-100 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Card */}
          <Card className="bg-gradient-to-br from-navy-500 to-navy-400 border-none shadow-xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-navy-50">
                Monthly Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(monthlyStats.expenses)}
                </div>
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/20">
                  <TrendingDown className="h-4 w-4 text-amber-300" />
                  <span className="text-amber-300 font-medium">-8.2%</span>
                </div>
                <span className="text-navy-100 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Net Profit Card */}
          <Card className="bg-gradient-to-br from-navy-400 to-navy-300 border-none shadow-xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-navy-50">
                Net Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(monthlyStats.netProfit)}
                </div>
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  <LineChart className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/20">
                  <TrendingUp className="h-4 w-4 text-blue-300" />
                  <span className="text-blue-300 font-medium">+15.3%</span>
                </div>
                <span className="text-navy-100 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Profit Margin Card */}
          <Card className="bg-gradient-to-br from-navy-300 to-navy-200 border-none shadow-xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-navy-50">
                Profit Margin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-white">
                  {monthlyStats.profitMargin}%
                </div>
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-500/20">
                  <TrendingUp className="h-4 w-4 text-indigo-300" />
                  <span className="text-indigo-300 font-medium">+2.4%</span>
                </div>
                <span className="text-navy-100 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rest of the dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your existing dashboard components */}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
