import React, { useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
    PieChart, Pie, Cell, Legend, Sector
} from "recharts";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } = props;

    // Safety check for percent
    const percentValue = (Number.isFinite(percent) ? percent : 0) * 100;
    const formattedPercent = `${percentValue.toFixed(0)}%`;

    return (
        <g>
            <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} className="text-lg font-bold" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                {payload.name}
            </text>
            <text x={cx} y={cy} dy={10} textAnchor="middle" fill={fill} className="text-2xl font-extrabold" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {`$${value.toLocaleString()}`}
            </text>
            <text x={cx} y={cy} dy={32} textAnchor="middle" fill="#9ca3af" className="text-xs" style={{ fontSize: '0.75rem' }}>
                {formattedPercent}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 8}
                outerRadius={outerRadius + 15}
                fill={fill}
                opacity={0.1}
            />
        </g>
    );
};

export function IncomeExpenseChart({ data, plannedIncome = 0 }) {
    // Calculate KPIs safely from data array
    const current = data[0] || { Income: 0, Expenses: 0 };
    const net = current.Income - current.Expenses;
    const savingsRate = current.Income > 0 ? ((net / current.Income) * 100).toFixed(1) : 0;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-auto min-h-[500px] dark:bg-gray-800 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Income vs Expenses</h3>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400">
                    {savingsRate}% Savings Rate
                </span>
            </div>

            {/* Top Row KPIs */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-700/30">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1 dark:text-gray-400">
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" /> Income
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">${current.Income.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-700/30">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1 dark:text-gray-400">
                        <ArrowDownRight className="w-3 h-3 text-rose-500" /> Expenses
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">${current.Expenses.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-lg dark:bg-gray-700/30 ${net >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1 dark:text-gray-400">
                        <Wallet className={`w-3 h-3 ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} /> Net
                    </p>
                    <p className={`font-bold text-sm sm:text-base ${net >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                        {net >= 0 ? '+' : ''}${net.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full min-h-[220px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        barSize={40}
                    >
                        <defs>
                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                <stop offset="100%" stopColor="#34d399" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                                <stop offset="100%" stopColor="#fb7185" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.4} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                            }}
                            labelStyle={{ color: '#6b7280', marginBottom: '8px', fontSize: '12px' }}
                            itemStyle={{ fontWeight: 600, fontSize: '13px' }}
                            formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                            formatter={(value) => <span className="text-gray-900 dark:text-gray-300 font-medium ml-1">{value}</span>}
                        />
                        <Bar
                            dataKey="Income"
                            fill="url(#incomeGradient)"
                            radius={[6, 6, 0, 0]}
                            animationDuration={1500}
                        />
                        <Bar
                            dataKey="Expenses"
                            fill="url(#expenseGradient)"
                            radius={[6, 6, 0, 0]}
                            animationDuration={1500}
                            animationBegin={300}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function CategoryPieChart({ data }) {
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-auto min-h-[500px] dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 dark:text-white">Expense Categories</h3>

            <div className="w-full flex-grow min-h-[220px] sm:min-h-[260px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius="50%"
                            outerRadius="70%"
                            fill="#8884d8"
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                            paddingAngle={4}
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-3">
                {data.map((entry, index) => (
                    <div
                        key={entry.name}
                        className={`
                            flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 border border-transparent
                            ${index === activeIndex ? 'bg-gray-50 border-gray-100 dark:bg-gray-700/50 dark:border-gray-600 shadow-sm scale-105' : 'opacity-70 hover:opacity-100 hover:bg-gray-50/50 dark:hover:bg-gray-700/30'}
                        `}
                        onMouseEnter={() => setActiveIndex(index)}
                    >
                        <div
                            className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-900 truncate dark:text-white capitalize">{entry.name}</p>
                            <div className="flex justify-between items-baseline">
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">${entry.value.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
