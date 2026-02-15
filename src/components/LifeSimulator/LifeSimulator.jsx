import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageContainer } from '../common/PageContainer';
import { SurfaceCard } from '../common/SurfaceCard';
import { useData } from '../../contexts/DataProvider';
import { calculateTax } from '../../engines/TaxEngine';
import { calculateBenefits } from '../../engines/BenefitsEngine';
import { projectWealth } from '../../engines/ProjectionEngine';
import { Loader2, RefreshCw, Save, TrendingUp } from 'lucide-react';

// Sub-components (Placeholders for now)
import NetPayPanel from './NetPayPanel';
import FamilyPanel from './FamilyPanel';
import DebtStrategyPanel from './DebtStrategyPanel';
import ScenarioControls from './ScenarioControls';
import FinancialHealthPanel from './FinancialHealthPanel';
import SimulationResults from './SimulationResults';
import ScenarioHeader from './ScenarioHeader';
import ScenarioInsights from './ScenarioInsights';

export default function LifeSimulator() {
    const { data } = useData();

    // --- State Initialization ---
    // We want to pull defaults from existing data but allow overrides
    // 1. Net Pay Inputs
    const [incomeState, setIncomeState] = useState({
        grossSalary: 160000,
        bonusPercent: 0,
        wifeWorking: true,
        wifeSalary: 85000,
        hasHecs: false,
        hasPrivateHospital: true,
        superContribution: 0, // Salary sacrifice
        wifeSuperContribution: 0
    });

    // 2. Family Inputs
    const [familyState, setFamilyState] = useState({
        hasKids: false,
        numKids: 0,
        kidAges: [], // Array of numbers
        daycareDays: 0,
        daycareRate: 150,
        isTwins: false,
        pplStarts: false
    });

    // 3. Scenario Inputs
    const [scenarioState, setScenarioState] = useState({
        rentOverride: 0,
        extraInvestment: 0,
        inflationRate: 3.5,
        investmentReturn: 7.0,
        privateSchoolCost: 0,
        newCarCost: 0
    });

    // 4. Debt Strategy (Local copy of debts to manipulate)
    const [simulatedDebts, setSimulatedDebts] = useState([]);

    // 5. Saved Scenarios
    const [savedScenarios, setSavedScenarios] = useState(() => {
        const saved = localStorage.getItem('lifeSim_scenarios');
        return saved ? JSON.parse(saved) : [];
    });

    // --- Actions ---
    const saveScenario = (name) => {
        const newScenario = {
            id: Date.now(),
            name,
            incomeState,
            familyState,
            scenarioState,
            simulatedDebts,
            date: new Date().toISOString()
        };
        const updated = [...savedScenarios, newScenario];
        setSavedScenarios(updated);
        localStorage.setItem('lifeSim_scenarios', JSON.stringify(updated));
    };

    const loadScenario = (id) => {
        const scenario = savedScenarios.find(s => s.id === id);
        if (scenario) {
            setIncomeState(scenario.incomeState);
            setFamilyState(scenario.familyState);
            setScenarioState(scenario.scenarioState);
            setSimulatedDebts(scenario.simulatedDebts);
        }
    };

    const deleteScenario = (id) => {
        const updated = savedScenarios.filter(s => s.id !== id);
        setSavedScenarios(updated);
        localStorage.setItem('lifeSim_scenarios', JSON.stringify(updated));
    };

    useEffect(() => {
        if (data?.debts && simulatedDebts.length === 0) {
            setSimulatedDebts(data.debts.map(d => ({ ...d })));
        }
    }, [data?.debts, simulatedDebts.length]);

    // --- Real-time Engines ---

    // 1. Calculate Net Pay
    const netPayResults = useMemo(() => {
        const myTax = calculateTax(incomeState.grossSalary * (1 + incomeState.bonusPercent / 100), {
            hasHecs: incomeState.hasHecs,
            hasPrivateHospital: incomeState.hasPrivateHospital,
            isFamily: true,
            combinedFamilyIncome: incomeState.grossSalary + (incomeState.wifeWorking ? incomeState.wifeSalary : 0),
            salarySacrifice: incomeState.superContribution
        });

        const wifeTax = incomeState.wifeWorking ? calculateTax(incomeState.wifeSalary, {
            hasHecs: false,
            hasPrivateHospital: incomeState.hasPrivateHospital,
            isFamily: true,
            combinedFamilyIncome: incomeState.grossSalary + incomeState.wifeSalary,
            salarySacrifice: incomeState.wifeSuperContribution
        }) : { netPay: 0, monthlyNet: 0 };

        return {
            me: myTax,
            wife: wifeTax,
            householdMonthly: myTax.monthlyNet + wifeTax.monthlyNet,
            householdAnnual: myTax.netPay + wifeTax.netPay
        };
    }, [incomeState]);

    // 2. Calculate Benefits
    const benefitsResults = useMemo(() => {
        if (!familyState.hasKids) return { ftbA: 0, ftbB: 0, ppl: 0, total: 0, monthly: 0 };
        return calculateBenefits({
            adjustedTaxableIncome: netPayResults.me.taxableIncome + netPayResults.wife.taxableIncome + (familyState.pplStarts ? 18316 : 0), // PPL is taxable - simplified addition
            primaryIncome: Math.max(netPayResults.me.gross, netPayResults.wife.gross),
            secondaryIncome: Math.min(netPayResults.me.gross, netPayResults.wife.gross),
            childAges: familyState.kidAges,
            isCouple: true,
            isTwins: familyState.isTwins,
            pplStarts: familyState.pplStarts
        });
    }, [netPayResults, familyState]);

    // 3. Projection (Base)
    const projectionResults = useMemo(() => {
        const baseMonthlySpend = 8000;
        const extraCosts = scenarioState.privateSchoolCost + scenarioState.newCarCost + scenarioState.rentOverride;
        const monthlyIncome = netPayResults.householdMonthly + benefitsResults.monthly;
        const monthlySurplus = monthlyIncome - baseMonthlySpend - extraCosts;

        return projectWealth({
            initialNetWorth: (data?.profile?.assets || 0) - simulatedDebts.reduce((s, d) => s + d.currentBalance, 0),
            monthlySurplus: Math.max(0, monthlySurplus),
            years: 5,
            debts: simulatedDebts,
            growthRate: scenarioState.investmentReturn / 100,
            inflationRate: scenarioState.inflationRate / 100
        });
    }, [netPayResults, benefitsResults, simulatedDebts, scenarioState, data?.profile]);

    // 4. Intelligence Calculations
    const intelligence = useMemo(() => {
        const baseMonthlySpend = 8000;
        const extraCosts = scenarioState.privateSchoolCost + scenarioState.newCarCost + scenarioState.rentOverride;
        const monthlyIncome = netPayResults.householdMonthly + benefitsResults.monthly;
        const monthlySurplus = monthlyIncome - baseMonthlySpend - extraCosts;

        // A. Scenario Label
        let label = "Standard Scenario";
        if (incomeState.wifeWorking) label = "Dual Income";
        else label = "Single Income";

        // Risk suffix
        const savingsRate = (monthlySurplus / monthlyIncome);
        if (savingsRate > 0.30) label += " – High Growth";
        else if (savingsRate > 0.10) label += " – Stable Growth";
        else if (monthlySurplus > 0) label += " – Tight Cashflow";
        else label += " – Deficit Risk";

        // B. Aggressive Debt Projection (Shadow Run)
        // Redirect 100% of positive surplus to debt payments (pro-rata or snowball - let's do pro-rata for simplicity or focus on highest interest)
        // Simpler: Just add total surplus to the first debt's payment? Or spread it.
        // Let's spread it to all debts proportional to balance? Or just one. 
        // Let's apply to the highest interest debt for "Smarter" advice.

        let aggressiveDuration = 5;
        if (simulatedDebts.length > 0 && monthlySurplus > 0) {
            const sortedDebts = [...simulatedDebts].sort((a, b) => b.interestRate - a.interestRate);
            // We can't easily use projectWealth for *duration* precise to month without refactoring.
            // But we can check the year it hits 0.
            // Let's run a projection with modified debts.

            const aggressiveDebts = simulatedDebts.map(d => {
                // Check if this is the highest interest debt
                const isHighest = d.id === sortedDebts[0].id; // Assuming ID exists or we use index match logic? 
                // SimulatedDebts might not have IDs if mapped from raw. Let's match by object ref (risky) or properties.
                // Let's just simply apply surplus to the first debt in the list for the 'shadow' check.
                // Actually, `projectWealth` iterates.
                return {
                    ...d,
                    monthlyRepayment: d.monthlyRepayment + (isHighest ? monthlySurplus : 0) // Dump all surplus into highest interest
                };
            });

            const aggProj = projectWealth({
                initialNetWorth: (data?.profile?.assets || 0),
                monthlySurplus: 0, // Surplus consumed by debt
                years: 5,
                debts: aggressiveDebts,
                growthRate: scenarioState.investmentReturn / 100,
                inflationRate: scenarioState.inflationRate / 100
            });

            // Find debt free year
            const freeNode = aggProj.find(p => p.debt <= 0);
            aggressiveDuration = freeNode ? freeNode.year : 5.1; // 5.1 means > 5
        }

        // C. Single Income Viability
        // Gap if wife stopped working
        const singleIncome = netPayResults.me.monthlyNet; // Assuming 'me' is primary
        const totalExpenses = baseMonthlySpend + extraCosts; // Using the baseline we used for surplus
        const singleIncomeGap = totalExpenses - singleIncome;

        return {
            label,
            aggressiveDebtFreeYear: aggressiveDuration,
            singleIncomeGap, // Positive means shortfall
            monthlySurplus
        };

    }, [netPayResults, benefitsResults, simulatedDebts, scenarioState, incomeState.wifeWorking, data?.profile]);


    return (
        <PageContainer title="Life Simulator" subtitle="Financial Decision Engine">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">

                {/* Main Content (Left) */}
                <div className="lg:col-span-12">
                    <ScenarioHeader
                        netPay={netPayResults}
                        benefits={benefitsResults}
                        projection={projectionResults}
                        debts={simulatedDebts}
                        inputs={{
                            rentOverride: scenarioState.rentOverride,
                        }}
                    />
                </div>

                <div className="lg:col-span-8 space-y-6">
                    <NetPayPanel
                        state={incomeState}
                        onChange={setIncomeState}
                        results={netPayResults}
                    />

                    <FamilyPanel
                        state={familyState}
                        onChange={setFamilyState}
                        results={benefitsResults}
                    />

                    <DebtStrategyPanel
                        debts={simulatedDebts}
                        onChange={setSimulatedDebts}
                    />

                    <ScenarioControls
                        state={scenarioState}
                        onChange={setScenarioState}
                    />

                    <SimulationResults
                        projection={projectionResults}
                        inputs={useMemo(() => ({
                            initialNetWorth: (data?.profile?.assets || 0),
                            monthlySurplus: intelligence.monthlySurplus, // Use calculated surplus
                            years: 5,
                            debts: simulatedDebts
                        }), [data?.profile?.assets, intelligence.monthlySurplus, simulatedDebts])}
                    />
                </div>

                {/* Sticky Sidebar (Right) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-6 space-y-6">
                        <ScenarioInsights
                            netPay={netPayResults}
                            debts={simulatedDebts}
                            projection={projectionResults}
                            inputs={{
                                benefits: benefitsResults.monthly,
                                rent: scenarioState.rentOverride,
                                expenses: 6500
                            }}
                        />
                        <FinancialHealthPanel
                            netPay={netPayResults}
                            benefits={benefitsResults}
                            projection={projectionResults}
                        />
                    </div>
                </div>

            </div>
        </PageContainer>
    );
}
