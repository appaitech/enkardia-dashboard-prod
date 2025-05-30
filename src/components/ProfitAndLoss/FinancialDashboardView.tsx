// FinancialDashboard.tsx
import React, { useState }from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// const headings = [
//   "Mar 24", "Apr 24", "May 24", "Jun 24", "Jul 24", "Aug 24",
//   "Sep 24", "Oct 24", "Nov 24", "Dec 24", "Jan 25", "Feb 25"
// ];

// const sales = [
//   176955.64, 206194.97, 271388.01, 278609.75, 335397.93,
//   351149.37, 403585.84, 367800.21, 424707.82, 262258.32,
//   266984.64, 359715.63
// ];

// const grossProfit = [
//   45563.73, 146455.69, 184231.18, 156961.43, 224373.49,
//   255373.52, 189294.14, 182965.72, 200133.60, 241953.62,
//   127532.56, 208918.02
// ];

// const netProfit = [
//   -68740.11, 1627.39, 22045.82, -41006.29, 15847.63,
//   77476.56, -24372.98, -42871.61, -13379.16, 48327.54,
//   -23460.08, 12738.81
// ];

// const costOfSales = [
//   131391.91, 59739.28, 87156.83, 121648.32, 111024.44,
//   95775.85, 214291.70, 184834.49, 224574.22, 20304.70,
//   139452.08, 150797.61
// ];

// const data = headings.map((month, i) => ({
//   month,
//   sales: +sales[i],
//   grossProfit: +grossProfit[i],
//   netProfit: +netProfit[i],
//   income: +sales[i],
//   costOfSales: +costOfSales[i],
// }));

export default function FinancialDashboardView({
  inputData
}) {

  const headingsReal = inputData.headings;
  console.log('headingsReal', headingsReal);

  //salesReal and income
  const incomeDataRowObject = inputData.grossProfitSections.find(x => x.title === "Income");

  const salesReal = [];
  const incomeReal = [];
  
  if (incomeDataRowObject !== undefined) {
    const totalSalesRow = incomeDataRowObject.dataRowObjects.find(x => x.rowType === "Row" && x.rowTitle === "Sales");
    if (totalSalesRow !== undefined)
    {
      const totalSalesRowRowData = totalSalesRow.rowData;
    
      totalSalesRowRowData.forEach(x => {
        const arrayValue = x === "-" ? 0 : x;
        salesReal.push(arrayValue);
      });
    }
    else {
      for (let k = 0; k < 12; k++) {
        salesReal.push(0);
      }
    }

    const totalIncomeSummaryRow = incomeDataRowObject.dataRowObjects.find(x => x.rowType === "SummaryRow" && x.rowTitle === "Total Income");
    if (totalIncomeSummaryRow !== undefined) {
      const totalIncomeSummaryRowRowData = totalIncomeSummaryRow.rowData;
    
      totalIncomeSummaryRowRowData.forEach(x => {
        const arrayValue = x === "-" ? 0 : x;
        incomeReal.push(arrayValue);
      });
    }
    else {
      for (let k = 0; k < 12; k++) {
        incomeReal.push(0);
      }
    }
  }
  else {
    for (let k = 0; k < 12; k++) {
      salesReal.push(0);
    }
    for (let k = 0; k < 12; k++) {
      incomeReal.push(0);
    }
  }
  console.log('salesReal', salesReal);
  console.log('incomeReal', incomeReal);

  //grossProfitReal
  const grossProfitDataRow = inputData.grossProfitDataRow;
  const grossProfitReal = [];
  grossProfitDataRow.forEach(x => {
    const arrayValue = x === "-" ? 0 : x;
    grossProfitReal.push(arrayValue);
  });
  console.log('grossProfitReal', grossProfitReal);

  //netProfitReal
  const netProfitDataRow = inputData.netProfitDataRow;
  const netProfitReal = [];
  netProfitDataRow.forEach(x => {
    const arrayValue = x === "-" ? 0 : x;
    netProfitReal.push(arrayValue);
  });
  console.log('netProfitReal', netProfitReal);

  //costOfSalessReal
  const costOfSalessReal = [];
  const lessCostOfSalesDataRowObject = inputData.grossProfitSections.find(x => x.title === "Less Cost of Sales");
  if (lessCostOfSalesDataRowObject !== undefined) {
    const costOfSalesSummaryRow = lessCostOfSalesDataRowObject.dataRowObjects.find(x => x.rowType === "SummaryRow" && x.rowTitle === "Total Cost of Sales");
    const costOfSalesSummaryRowRowData = costOfSalesSummaryRow.rowData;
    
    costOfSalesSummaryRowRowData.forEach(x => {
      const arrayValue = x === "-" ? 0 : x;
      costOfSalessReal.push(arrayValue);
    });
  }
  else {
    for (let k = 0; k < 12; k++) {
      costOfSalessReal.push(0);
    }
  }
  console.log('costOfSalessReal', costOfSalessReal);

  // const modData = {
  //   sales: [ ...salesReal ],
  //   grossProfit: [ ...grossProfitReal ],
  //   netProfit: [ ...netProfitReal ],
  //   income: [ ...income ],
  //   costOfSales: [ ...costOfSalessReal ],
  // }

  // console.log('modData', modData);

  const data = headingsReal.map((month, i) => ({
    month,
    sales: +salesReal[i],
    grossProfit: +grossProfitReal[i],
    netProfit: +netProfitReal[i],
    income: +incomeReal[i],
    costOfSales: +costOfSalessReal[i],
  }));

  console.log(data);

  return (
    <div className="p-6 space-y-12 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 Financial Dashboard</h1>

      {/* Sales, Gross Profit & Net Profit */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Trends: Sales, Gross Profit & Net Profit</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#4f46e5" name="Sales" />
            <Line type="monotone" dataKey="grossProfit" stroke="#10b981" name="Gross Profit" />
            <Line type="monotone" dataKey="netProfit" stroke="#ef4444" name="Net Profit" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Income vs Cost of Sales */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Income vs Cost of Sales</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#3b82f6" name="Income" />
            <Bar dataKey="costOfSales" fill="#f59e0b" name="Cost of Sales" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Net Profit Bar */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Net Profit (Bar)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="netProfit" name="Net Profit" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}