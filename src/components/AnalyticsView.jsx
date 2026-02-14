import React from 'react';
import { PageContainer } from './common/PageContainer';
import { IncomeExpenseChart, CategoryPieChart } from './FinanceChart';
import SpendingIntelligence from './SpendingIntelligence';

export default function AnalyticsView({ incomeExpenseData, categoryData, transactions, plannedIncome }) {
    return (
        <PageContainer
            title="Analytics"
            subtitle="Deep dive into your financial performance"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Income vs Expenses Chart */}
                <IncomeExpenseChart data={incomeExpenseData} plannedIncome={plannedIncome} />

                {/* Expense Breakdown Pie Chart */}
                <CategoryPieChart data={categoryData} />
            </div>

            {/* Spending Intelligence (Category Trends & Insights) */}
            <div className="mt-6">
                <SpendingIntelligence transactions={transactions} />
            </div>
        </PageContainer>
    );
}
