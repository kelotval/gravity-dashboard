/**
 * PayoffEngine.js
 * Logic for calculating debt repayment strategies and warnings.
 */

// Calculate current rate based on scheduled changes
export const getCurrentRate = (debt) => {
    // If futureRates exist, check if any have passed
    if (debt.futureRates && debt.futureRates.length > 0) {
        const today = new Date();
        // Sort rates by date descending (newest first)
        const sortedRates = [...debt.futureRates].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Find first rate that is in the past
        const activeRate = sortedRates.find(r => new Date(r.date) <= today);
        if (activeRate) return activeRate.rate;
    }
    return debt.interestRate || 0;
};

// Generate smart signals/alerts based on severity
export const getRateWarnings = (debts) => {
    const today = new Date();
    const ninetyDaysOut = new Date();
    ninetyDaysOut.setDate(today.getDate() + 90);

    const alerts = [];

    debts.forEach(debt => {
        const currentRate = getCurrentRate(debt);

        // 1. Rate Change Alerts
        if (debt.futureRates) {
            debt.futureRates.forEach(rateConfig => {
                const rateDate = new Date(rateConfig.date);
                if (rateDate > today && rateDate <= ninetyDaysOut) {
                    const days = Math.ceil((rateDate - today) / (1000 * 60 * 60 * 24));
                    const isHike = rateConfig.rate > currentRate;

                    if (isHike) {
                        const delta = rateConfig.rate - currentRate;
                        const validDelta = Math.max(delta, 0);
                        const monthlyImpact = (debt.currentBalance * (validDelta / 100)) / 12;

                        alerts.push({
                            type: 'RATE_HIKE',
                            severity: days <= 30 ? 'critical' : 'warning',
                            label: days <= 30 ? 'Rate Hike Imminent' : 'Upcoming Rate Change',
                            debtName: debt.name,
                            message: `Interest rate jumping from ${currentRate}% to ${rateConfig.rate}%.`,
                            action: days <= 30 ? 'Refinance / Payoff' : 'Plan Payoff',
                            impact: monthlyImpact > 0 ? `+$${Math.round(monthlyImpact)}/mo interest` : null,
                            timeframe: `${days} days`
                        });
                    }
                }
            });
        }

        // 2. High Cost Debt Alerts (Active)
        if (currentRate >= 18) {
            // Only alert if we haven't already flagged a critical rate hike for this debt
            const hasRateHike = alerts.some(a => a.debtName === debt.name && a.type === 'RATE_HIKE');
            if (!hasRateHike) {
                const monthlyBurn = (debt.currentBalance * (currentRate / 100)) / 12;
                alerts.push({
                    type: 'HIGH_INTEREST',
                    severity: 'critical',
                    label: 'High Interest Drain',
                    debtName: debt.name,
                    message: `You are paying ${currentRate}% interest on this balance.`,
                    action: 'Target Priority',
                    impact: `-$${Math.round(monthlyBurn)}/mo waste`,
                    timeframe: 'Immediate'
                });
            }
        }
    });

    // Sort by severity (Critical > Warning > Info)
    const severityScore = { critical: 3, warning: 2, info: 1 };
    return alerts.sort((a, b) => severityScore[b.severity] - severityScore[a.severity]);
};

// Calculate payoff order and projections
// Strategy: 'AVALANCHE' (High Interest First) or 'SNOWBALL' (Lowest Balance First)
export const calculatePayoffStrategy = (debts, strategy = 'AVALANCHE') => {
    const recommendation = [...debts];

    if (strategy === 'AVALANCHE') {
        recommendation.sort((a, b) => {
            // Sort by Rate Descending
            const rateA = getCurrentRate(a);
            const rateB = getCurrentRate(b);
            return rateB - rateA;
        });
    } else {
        recommendation.sort((a, b) => {
            // Sort by Balance Ascending
            return a.currentBalance - b.currentBalance;
        });
    }

    return recommendation;
};

// Rate Change Awareness Logic
export const deriveDebtStatus = (debt) => {
    const today = new Date();
    // Reset time part of today for accurate day diff
    today.setHours(0, 0, 0, 0);

    let effectiveChangeDate = null;
    if (debt.promoEndDate) {
        effectiveChangeDate = new Date(debt.promoEndDate);
    } else if (debt.rateChangeEffectiveDate) {
        effectiveChangeDate = new Date(debt.rateChangeEffectiveDate);
    }

    if (!effectiveChangeDate) {
        return {
            statusChip: "No Scheduled Change",
            statusLevel: "none",
            daysToChange: null
        };
    }

    // Reset time part of target date
    effectiveChangeDate.setHours(0, 0, 0, 0);

    const diffTime = effectiveChangeDate - today;
    const daysToChange = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let statusChip = "On Track";
    let statusLevel = "low";

    if (daysToChange <= 0) {
        statusChip = "🔴 Active High Interest";
        statusLevel = "critical";
    } else if (daysToChange <= 30) {
        statusChip = "🟠 High Risk";
        statusLevel = "high";
    } else if (daysToChange <= 60) {
        statusChip = "🟡 Upcoming Risk";
        statusLevel = "medium";
    }

    return {
        statusChip,
        statusLevel,
        daysToChange
    };
};

// Effective Rate Logic (Auto-Switching)
export const calculateEffectiveRateState = (debt) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let effectiveChangeDate = null;
    if (debt.promoEndDate) {
        effectiveChangeDate = new Date(debt.promoEndDate);
    } else if (debt.rateChangeEffectiveDate) {
        effectiveChangeDate = new Date(debt.rateChangeEffectiveDate);
    }

    let effectiveRatePct = debt.interestRate || 0;
    let rateIsSwitched = false;

    // Logic Rule 1: No date = current rate
    if (!effectiveChangeDate) {
        effectiveRatePct = debt.interestRate || 0;
        rateIsSwitched = false;
    } else {
        // Logic Rule 2: Date exists
        effectiveChangeDate.setHours(0, 0, 0, 0);

        if (today < effectiveChangeDate) {
            // Not yet passed
            effectiveRatePct = debt.interestRate || 0;
            rateIsSwitched = false;
        } else {
            // Passed or Today
            // Use futureRate if it exists (assuming the first one or finding match)
            // For now, simpler logic based on request: "If today >= effectiveChangeDate AND futureRatePct exists"
            // We'll look at the first futureRate as the "revert rate"
            if (debt.futureRates && debt.futureRates.length > 0) {
                // Sort to find the one matching the date or just the latest?
                // Existing logic sorts descending.
                // Let's grab the rate that corresponds to the effective change date if possible.
                const matchingRate = debt.futureRates.find(r => {
                    const rDate = new Date(r.date);
                    rDate.setHours(0, 0, 0, 0);
                    return rDate.getTime() === effectiveChangeDate.getTime();
                });

                if (matchingRate) {
                    effectiveRatePct = matchingRate.rate;
                    rateIsSwitched = true;
                } else if (debt.futureRates.length > 0) {
                    // Fallback to first if explicit match not found but exists (e.g. data mismatch)
                    effectiveRatePct = debt.futureRates[0].rate;
                    rateIsSwitched = true;
                }
            }
        }
    }

    // Logic Rule 3: High Cost Flag
    const highCostDebtFlag = effectiveRatePct >= 18;

    return {
        effectiveRatePct,
        rateIsSwitched,
        highCostDebtFlag
    };
};

export const getDebtRiskBanners = (debts) => {
    const banners = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    debts.forEach(debt => {
        const { statusLevel, daysToChange } = deriveDebtStatus(debt);
        const { effectiveRatePct, rateIsSwitched, highCostDebtFlag } = calculateEffectiveRateState(debt);

        // Filter based on risk: Medium/High/Critical OR High Cost Flag
        if (["medium", "high", "critical"].includes(statusLevel) || highCostDebtFlag) {

            let alertType = "";
            let icon = "";
            let showEstimate = false;

            // Logic for Alert Type
            // 1. Switched / Active High Interest
            let effectiveChangeDate = null;
            if (debt.promoEndDate) effectiveChangeDate = new Date(debt.promoEndDate);
            else if (debt.rateChangeEffectiveDate) effectiveChangeDate = new Date(debt.rateChangeEffectiveDate);

            if (effectiveChangeDate) effectiveChangeDate.setHours(0, 0, 0, 0);

            if (effectiveChangeDate && today >= effectiveChangeDate) {
                alertType = "🔥 High-Interest Active Debt";
                showEstimate = true;
            } else if (daysToChange !== null && daysToChange <= 30) {
                alertType = "⚠️ Interest Rate Increase Coming";
                showEstimate = true;
            } else if (debt.promoEndDate && daysToChange !== null && daysToChange <= 60) {
                alertType = "⏳ Promo Ending Soon";
            } else if (highCostDebtFlag) {
                alertType = "💸 High Cost Debt Alert";
                showEstimate = true;
            } else {
                alertType = "Attention Required";
            }

            // Estimate Impact
            let estimatedExtraMonthlyInterest = null;
            let oldRate = debt.interestRate || 0;
            let newRate = effectiveRatePct; // Default to effective

            // If we are predicting a future jump (not yet switched)
            if (!rateIsSwitched && debt.futureRates && debt.futureRates.length > 0) {
                // assume the first future rate is the target
                newRate = debt.futureRates[0].rate;
            }

            // Calculate delta
            const deltaRatePct = Math.max(newRate - oldRate, 0);

            // If delta > 0, calculate cost
            if (deltaRatePct > 0) {
                estimatedExtraMonthlyInterest = (debt.currentBalance * (deltaRatePct / 100)) / 12;
            } else if (rateIsSwitched && highCostDebtFlag) {
                // If already switched, the "Extra" cost is effectively the whole interest if compared to 0, 
                // OR we can just show the current interest cost as "High Cost"
                // User request says: "Estimated extra monthly interest cost from rate change"
                // If already switched, Old Rate was likely lower. 
                // We can't strictly know the old rate unless we stored it, but basic logic:
                // estimatedExtraMonthlyInterest was requested dependent on futureRate existence? 
                // "If futureRatePct exists: delta = max(future - current, 0)"

                // Let's rely on the requested logic:
                if (debt.futureRates && debt.futureRates.length > 0) { // simplistic check
                    // If switched, effective is the new rate. 
                    // We probably want to show what this debt IS costing vs what it WAS.
                    // But for strict adherence to spec:
                    // "oldRate = currentRatePct, newRate = futureRatePct if today >= effectiveChangeDate else ... "
                    // Wait, if today >= effectiveChangeDate, currentRate IS the old 0% stored in data.js basic field? 
                    // No, data.js has interestRate: 0. 
                    // So effectively:
                    // oldRate = debt.interestRate (0)
                    // newRate = effectiveRatePct (21.49)

                    const delta = Math.max(effectiveRatePct - (debt.interestRate || 0), 0);
                    if (delta > 0) {
                        estimatedExtraMonthlyInterest = (debt.currentBalance * (delta / 100)) / 12;
                    }
                }
            }

            banners.push({
                id: debt.id,
                debtName: debt.name,
                alertType,
                daysToChange,
                oldRate: debt.interestRate || 0,
                newRate,
                estimatedExtraMonthlyInterest,
                severity: statusLevel === 'critical' || highCostDebtFlag ? 3 : statusLevel === 'high' ? 2 : 1
            });
        }
    });

    // Sort by severity desc, then daysToChange asc
    return banners.sort((a, b) => {
        if (b.severity !== a.severity) return b.severity - a.severity;
        return (a.daysToChange || 999) - (b.daysToChange || 999);
    });
};

// Smart Payoff Strategy Logic
export const calculatePriorityScore = (debt, horizonDays = 90) => {
    const { effectiveRatePct, rateIsSwitched } = calculateEffectiveRateState(debt);
    const { daysToChange } = deriveDebtStatus(debt);

    // Step 1: Risk Adjusted Rate
    let riskAdjustedRatePct = effectiveRatePct;
    let futureRatePct = 0;

    if (debt.futureRates && debt.futureRates.length > 0) {
        futureRatePct = debt.futureRates[0].rate;
        // If change is coming soon (within horizon) and not yet switched, risk is the future rate
        if (daysToChange !== null && daysToChange > 0 && daysToChange <= horizonDays) {
            riskAdjustedRatePct = futureRatePct;
        }
    } else if (debt.futureRatePct) {
        futureRatePct = debt.futureRatePct;
        // Check if riskFlag suggests urgency
        if (debt.riskFlag) {
            // Treat as risk if flag is present? Or just rely on user input in UI
        }
    }

    // Step 2: Scoring
    const normalize = (val, max) => Math.min(Math.max(val / max, 0), 1);

    // Rate Score (0-45)
    // Normalize 0..30% -> 0..1
    const rateScore = normalize(riskAdjustedRatePct, 30) * 45;

    // Time Score (0-25)
    let timeScore = 0;
    if (daysToChange !== null && daysToChange > 0 && daysToChange <= horizonDays) {
        // Closer to 0 means higher score
        timeScore = normalize((horizonDays - daysToChange), horizonDays) * 25;
    } else if (daysToChange !== null && daysToChange <= 0 && rateIsSwitched) {
        // Already happened, urgency is slightly lower than "about to happen"? 
        // Request says: "if daysToChange <= 0: timeScore = 25" (Urgent!)
        timeScore = 25;
    }

    // Jump Score (0-20)
    let jumpScore = 0;
    if (futureRatePct > 0) {
        // Normalize jump of 20%
        const jump = Math.max(futureRatePct - (debt.interestRate || 0), 0);
        jumpScore = normalize(jump, 20) * 20;
    }

    // Type Bonus
    let typeBonus = 0;
    if (debt.debtType === "Credit Card") typeBonus = 10;
    else if (debt.debtType === "Personal Loan") typeBonus = 4;

    const priorityScore = rateScore + timeScore + jumpScore + typeBonus;

    return {
        priorityScore,
        riskAdjustedRatePct,
        components: { rateScore, timeScore, jumpScore, typeBonus }
    };
};

// Helper: Simulate payoff to get precise interest and time
const simulatePayoff = (debt, monthlyPayment) => {
    let balance = debt.currentBalance;
    let totalInterest = 0;
    let months = 0;
    const currentRate = getCurrentRate(debt);
    const monthlyRate = currentRate / 100 / 12;

    // Safety brake for infinite loops (e.g. payment < interest)
    if (monthlyPayment <= balance * monthlyRate) {
        return { totalInterest: Infinity, months: 999 };
    }

    while (balance > 0 && months < 600) { // 50 year cap
        const interest = balance * monthlyRate;
        const principal = Math.min(monthlyPayment - interest, balance);

        totalInterest += interest;
        balance -= principal;
        months++;
    }

    return { totalInterest, months };
};

export const generatePayoffAllocation = (debts, surplusCash, horizonDays = 90) => {
    // 1. Calculate scores
    const scoredDebts = debts.map(d => {
        const scores = calculatePriorityScore(d, horizonDays);
        return { ...d, ...scores };
    });

    // 2. Sort by Priority Desc
    scoredDebts.sort((a, b) => b.priorityScore - a.priorityScore);

    // 3. Allocate
    let remainingSurplus = surplusCash;
    const allocation = scoredDebts.map(d => {
        const minPay = d.monthlyRepayment;
        let extraPay = 0;

        if (remainingSurplus > 0) {
            extraPay = remainingSurplus;
            remainingSurplus = 0; // All used on top priority
        }

        const totalMonthly = minPay + extraPay;

        // 4. Run Simulations
        // Baseline: paying only minimums
        const baseline = simulatePayoff(d, minPay);

        // Optimized: paying min + extra
        const optimized = simulatePayoff(d, totalMonthly);

        const interestSaved = Math.max(baseline.totalInterest - optimized.totalInterest, 0);
        const timeSaved = Math.max(baseline.months - optimized.months, 0);

        return {
            ...d,
            allocation: {
                minPay,
                extraPay,
                totalPay: totalMonthly,
                monthsToPayoff: optimized.months,
                projectedInterest: optimized.totalInterest,
                impact: {
                    interestSaved,
                    timeSaved
                }
            }
        };
    });

    return allocation;
};

// Interest Risk & Cost Control Logic
export const calculateInterestProjections = (debts) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Projections (3, 6, 12 months)
    let total3Month = 0;
    let total6Month = 0;
    let total12Month = 0;

    // 2. Savings Opportunities
    const savingsOpportunities = [];

    // 3. Cost of Delay
    let worstOffender = null;
    let maxCostOfDelay = -1;

    debts.forEach(debt => {
        // --- 1. Projections ---
        // Basic assumption: balance stays constant to show "Cost of holding debt"
        // If we want real projection we'd simulate payments, but request says "Estimated monthly interest"
        // "split the window into before/after days"

        const calculateProjectedInterest = (months) => {
            const endDate = new Date(today);
            endDate.setMonth(endDate.getMonth() + months);

            let effectiveChangeDate = null;
            if (debt.promoEndDate) effectiveChangeDate = new Date(debt.promoEndDate);
            else if (debt.rateChangeEffectiveDate) effectiveChangeDate = new Date(debt.rateChangeEffectiveDate);
            if (effectiveChangeDate) effectiveChangeDate.setHours(0, 0, 0, 0);

            // Determine rates
            let currentRate = debt.interestRate || 0;
            let futureRate = currentRate;

            // If already switched, current is the effective rate calculation or just use logic?
            // "use currentRatePct before, futureRatePct after"
            // If switched, "current" IS the active high rate.
            // Let's rely on data model:
            // If today < effectiveChangeDate, we are in 'currentRate' zone.
            // If effectiveChangeDate exists and is in future, we have a switch.

            let activeRate1 = currentRate;
            let activeRate2 = currentRate;

            // Check if switch happens within window and is in future
            if (effectiveChangeDate && effectiveChangeDate > today && effectiveChangeDate <= endDate && debt.futureRates?.length > 0) {
                activeRate2 = debt.futureRates[0].rate; // future
            } else if (effectiveChangeDate && effectiveChangeDate <= today && debt.futureRates?.length > 0) {
                // Already switched
                activeRate1 = debt.futureRates[0].rate;
                activeRate2 = debt.futureRates[0].rate;
            }

            // Calculation
            // If no switch in window or already switched: simple
            if (activeRate1 === activeRate2) {
                return (debt.currentBalance * (activeRate1 / 100) / 12) * months;
            } else {
                // Split
                // Days until change
                const diffTime = effectiveChangeDate - today;
                const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const daysTotal = months * 30; // Approx

                const ratio1 = Math.min(daysUntil, daysTotal) / daysTotal;
                const ratio2 = 1 - ratio1;

                const monthly1 = (debt.currentBalance * (activeRate1 / 100) / 12);
                const monthly2 = (debt.currentBalance * (activeRate2 / 100) / 12);

                return (monthly1 * months * ratio1) + (monthly2 * months * ratio2);
            }
        };

        total3Month += calculateProjectedInterest(3);
        total6Month += calculateProjectedInterest(6);
        total12Month += calculateProjectedInterest(12);


        // --- 2. Savings Opportunities ---
        let effectiveChangeDate = null;
        if (debt.promoEndDate) effectiveChangeDate = new Date(debt.promoEndDate);
        else if (debt.rateChangeEffectiveDate) effectiveChangeDate = new Date(debt.rateChangeEffectiveDate);

        if (effectiveChangeDate && effectiveChangeDate > today && debt.futureRates && debt.futureRates.length > 0) {
            const futureRate = debt.futureRates[0].rate;
            const currentRate = debt.interestRate || 0;
            const diffRate = futureRate - currentRate;

            if (diffRate > 0) {
                // Months remaining after change within 12 mo
                // If change is in 3 months, we have 9 months of higher rate in a year window
                const changeMonth = new Date(effectiveChangeDate);
                const splitDate = new Date(today);
                splitDate.setMonth(today.getMonth() + 12);

                if (changeMonth < splitDate) {
                    // Approximate months of high interest
                    const diffTime = splitDate - changeMonth;
                    const monthsOfHigh = diffTime / (1000 * 60 * 60 * 24 * 30);

                    const monthlySavings = (debt.currentBalance * (diffRate / 100) / 12);
                    const totalSavings = monthlySavings * monthsOfHigh;

                    savingsOpportunities.push({
                        id: debt.id,
                        name: debt.name,
                        amount: totalSavings,
                        monthly: monthlySavings
                    });
                }
            }
        }

        // --- 3. Cost of Delay ---
        // "if futureRatePct exists AND today < effectiveChangeDate: costPerMonth = balance * ((future - current)/100)/12"
        // "else costPerMonth = balance * (effective / 100) / 12"
        let costPerMonth = 0;
        const { effectiveRatePct } = calculateEffectiveRateState(debt);

        let futureRate = debt.interestRate || 0;
        if (debt.futureRates?.length > 0) futureRate = debt.futureRates[0].rate;

        let effectiveChangeDateDelay = null;
        if (debt.promoEndDate) effectiveChangeDateDelay = new Date(debt.promoEndDate);
        else if (debt.rateChangeEffectiveDate) effectiveChangeDateDelay = new Date(debt.rateChangeEffectiveDate);
        if (effectiveChangeDateDelay) effectiveChangeDateDelay.setHours(0, 0, 0, 0);

        if (effectiveChangeDateDelay && today < effectiveChangeDateDelay && debt.futureRates?.length > 0) {
            const diff = futureRate - (debt.interestRate || 0);
            if (diff > 0) {
                costPerMonth = (debt.currentBalance * (diff / 100)) / 12;
            }
        } else {
            // Already high or standard
            costPerMonth = (debt.currentBalance * (effectiveRatePct / 100)) / 12;
        }

        if (costPerMonth > maxCostOfDelay) {
            maxCostOfDelay = costPerMonth;
            worstOffender = {
                id: debt.id,
                name: debt.name,
                cost: costPerMonth
            };
        }

    });

    savingsOpportunities.sort((a, b) => b.amount - a.amount);

    return {
        projections: {
            months3: total3Month,
            months6: total6Month,
            months12: total12Month
        },
        savingsOpportunities: savingsOpportunities.slice(0, 3),
        worstOffender
    };
};
