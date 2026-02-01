import React, { useState, useMemo } from "react";
import { Globe, TrendingUp, DollarSign, AlertTriangle, Copy, Download, Upload, Plus, Copy as Duplicate, Trash2, CheckCircle, Target, BarChart3, Settings as SettingsIcon, Zap, Award, Clock, TrendingDown, Shield, Lock } from "lucide-react";
import { computeRelocationOutcome, toAud } from "../data/relocationOffers";
import { MoneyBreakdownTab, AssumptionsTab, NegotiationSimulatorTab, AIInsights } from "./RelocationTabs";
import CareerPathSimulator from "./CareerPathSimulator";

export default function RelocationCommandCenter({
    relocation,
    setRelocation,
    debts,
    transactions,
    income
}) {
    const [editingOfferId, setEditingOfferId] = useState(null);
    const [draggedOfferId, setDraggedOfferId] = useState(null);

    const { offers, assumptions, selectedOfferIds, baselineId, primaryOfferId } = relocation;

    // Compute outcomes for all offers
    const outcomes = useMemo(() => {
        const baseline = offers.find(o => o.id === baselineId);
        const results = {};

        offers.forEach(offer => {
            results[offer.id] = computeRelocationOutcome({
                offer,
                baseline,
                assumptions,
                debts,
                transactions
            });
        });

        return results;
    }, [offers, assumptions, baselineId, debts, transactions]);

    // Helper functions
    const toggleOfferSelection = (offerId) => {
        const newSelected = selectedOfferIds.includes(offerId)
            ? selectedOfferIds.filter(id => id !== offerId)
            : selectedOfferIds.length < 3
                ? [...selectedOfferIds, offerId]
                : selectedOfferIds;

        setRelocation({ ...relocation, selectedOfferIds: newSelected });
    };

    const setBaseline = (offerId) => {
        setRelocation({ ...relocation, baselineId: offerId });
    };

    const setPrimaryOffer = (offerId) => {
        setRelocation({ ...relocation, primaryOfferId: offerId });
    };

    const deleteOffer = (offerId) => {
        if (offerId === 'sydney') {
            alert('Cannot delete Sydney baseline');
            return;
        }
        if (!confirm('Delete this offer?')) return;

        const newOffers = offers.filter(o => o.id !== offerId);
        const newSelected = selectedOfferIds.filter(id => id !== offerId);
        setRelocation({
            ...relocation,
            offers: newOffers,
            selectedOfferIds: newSelected,
            primaryOfferId: primaryOfferId === offerId ? baselineId : primaryOfferId
        });
    };

    const duplicateOffer = (offerId) => {
        const offer = offers.find(o => o.id === offerId);
        if (!offer) return;

        const variantCount = offers.filter(o => o.name.startsWith(offer.name)).length;
        const newOffer = {
            ...offer,
            id: `${offer.id}_variant_${Date.now()}`,
            name: `${offer.name} (Variant ${variantCount})`,
            lastUpdated: new Date().toISOString()
        };

        setRelocation({ ...relocation, offers: [...offers, newOffer] });
    };

    const addNewOffer = () => {
        const newOffer = {
            id: `custom_${Date.now()}`,
            name: 'New Offer',
            country: 'Unknown',
            currency: 'AUD',
            netMonthlyPayLocal: 0,
            netMonthlyPayAud: 0,
            housingMonthlyLocal: 0,
            housingIncluded: false,
            transportMonthlyLocal: 0,
            utilitiesMonthlyLocal: 0,
            schoolingMonthlyLocal: 0,
            healthcareMonthlyLocal: 0,
            relocationFlightsPerYearLocal: 0,
            annualBonusLocal: 0,
            signOnBonusLocal: 0,
            oneOffRelocationLocal: 0,
            taxNotes: '',
            benefits: [],
            risks: [],
            lastUpdated: new Date().toISOString()
        };

        setRelocation({ ...relocation, offers: [...offers, newOffer] });
        setEditingOfferId(newOffer.id);
    };

    const handleDragStart = (offerId) => {
        setDraggedOfferId(offerId);
    };

    const handleDragOver = (e, targetOfferId) => {
        e.preventDefault();
        if (!draggedOfferId || draggedOfferId === targetOfferId) return;

        const draggedIdx = offers.findIndex(o => o.id === draggedOfferId);
        const targetIdx = offers.findIndex(o => o.id === targetOfferId);

        const newOffers = [...offers];
        const [removed] = newOffers.splice(draggedIdx, 1);
        newOffers.splice(targetIdx, 0, removed);

        setRelocation({ ...relocation, offers: newOffers });
    };

    const handleDragEnd = () => {
        setDraggedOfferId(null);
    };

    const updateOfferField = (offerId, field, value) => {
        const newOffers = offers.map(o =>
            o.id === offerId ? { ...o, [field]: value, lastUpdated: new Date().toISOString() } : o
        );
        setRelocation({ ...relocation, offers: newOffers });
    };

    const updateAssumption = (field, value) => {
        setRelocation({
            ...relocation,
            assumptions: { ...assumptions, [field]: value }
        });
    };

    const updateRelocation = (field, value) => {
        setRelocation({ ...relocation, [field]: value });
    };

    // Get best offers
    const bestCashflow = useMemo(() => {
        return offers.reduce((best, offer) => {
            const outcome = outcomes[offer.id];
            const bestOutcome = outcomes[best.id];
            return outcome.netAfterDebtsAudMonthly > bestOutcome.netAfterDebtsAudMonthly ? offer : best;
        }, offers[0]);
    }, [offers, outcomes]);

    const bestQuality = useMemo(() => {
        return offers.reduce((best, offer) => {
            const outcome = outcomes[offer.id];
            const bestOutcome = outcomes[best.id];
            return outcome.qualityScore > bestOutcome.qualityScore ? offer : best;
        }, offers[0]);
    }, [offers, outcomes]);

    const selectedOffers = offers.filter(o => selectedOfferIds.includes(o.id));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white shadow-lg">
                        <Globe className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Relocation Command Center
                            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">v2.0</span>
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Simulate international career moves & wealth impact</p>
                    </div>
                </div>
            </div>

            <div className="h-[calc(100vh-200px)] min-h-[800px]">
                <CareerPathSimulator
                    relocation={relocation}
                    updateRelocation={updateRelocation}
                    selectedOffers={selectedOffers}
                    outcomes={outcomes}
                    assumptions={assumptions}
                    updateAssumption={updateAssumption}
                    addNewOffer={addNewOffer}
                />
            </div>
        </div>
    );
}

// Keeping SummaryTab and others for potential future reuse or as sub-components if needed
// but preventing them from rendering in the main view for now.
function LegacyContentPlaceholder() { return null; }


// Summary Tab Component - Redesigned for Decision Focus
function SummaryTab({ selectedOffers, outcomes, bestCashflow, bestQuality, baselineId, assumptions }) {
    const [showDeltaAnnual, setShowDeltaAnnual] = useState(false);

    if (selectedOffers.length === 0) {
        return (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <Globe className="w-20 h-20 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select offers from the left panel to compare</p>
                <p className="text-sm mt-2">Click up to 3 offers to get started</p>
            </div>
        );
    }

    const baseline = selectedOffers.find(o => o.id === baselineId) || selectedOffers[0];
    const primaryOffer = selectedOffers.find(o => selectedOffers.indexOf(o) === 1) || selectedOffers[0];

    // Determine primary recommendation
    const recommendedOffer = bestQuality;
    const baselineOutcome = outcomes[baseline.id];
    const recommendedOutcome = outcomes[recommendedOffer.id];

    // Calculate reasons
    const reasons = [];
    if (recommendedOffer.id === bestCashflow.id) reasons.push("Best Cashflow");
    if (recommendedOffer.id === bestQuality.id) reasons.push("Best Quality Score");
    if (recommendedOutcome.netAfterDebtsAudMonthly > baselineOutcome.netAfterDebtsAudMonthly * 1.3) {
        reasons.push("Fastest Wealth Acceleration");
    }
    if (recommendedOutcome.runwayMonths >= 12) reasons.push("Strong Safety Buffer");

    return (
        <div className="space-y-6">
            {/* 1) HERO DECISION BAR */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 dark:from-indigo-900 dark:via-purple-900 dark:to-blue-900 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-indigo-100 dark:text-indigo-300 text-sm font-medium mb-1">Primary Recommendation</div>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Award className="w-8 h-8" />
                            {recommendedOffer.name}
                        </h2>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-white">
                            ${Math.round(recommendedOutcome.netAfterDebtsAudMonthly).toLocaleString()}
                        </div>
                        <div className="text-indigo-200 dark:text-indigo-300 text-sm">net after debts/mo</div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                    {reasons.map(reason => (
                        <span key={reason} className="px-3 py-1.5 bg-white/20 dark:bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
                            ✓ {reason}
                        </span>
                    ))}
                </div>

                <p className="text-indigo-100 dark:text-indigo-300 text-xs">
                    Based on current assumptions and {selectedOffers.length} selected offer{selectedOffers.length > 1 ? 's' : ''}
                </p>
            </div>



            {/* AI Insights Section */}
            <div className="mb-6">
                <AIInsights
                    selectedOffers={selectedOffers}
                    outcomes={outcomes}
                    assumptions={assumptions}
                    baselineId={baselineId}
                />
            </div>

            {/* 2) DECISION SNAPSHOT ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[baseline, primaryOffer, recommendedOffer].filter((offer, idx, arr) =>
                    arr.findIndex(o => o.id === offer.id) === idx
                ).slice(0, 3).map(offer => {
                    const outcome = outcomes[offer.id];
                    const isBaseline = offer.id === baselineId;
                    const isBest = offer.id === recommendedOffer.id;
                    const delta = outcome.netAfterDebtsAudMonthly - baselineOutcome.netAfterDebtsAudMonthly;

                    // Determine verdict
                    let verdict = "Moderate upside";
                    if (isBaseline) verdict = "Stable baseline";
                    else if (outcome.qualityScore >= 80) verdict = "Aggressive upside";
                    else if (outcome.qualityScore < 50) verdict = "High risk, low reward";

                    return (
                        <div
                            key={offer.id}
                            className={`relative rounded-2xl p-5 border-2 transition-all duration-200 ${isBest
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-lg shadow-emerald-500/20'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                }`}
                        >
                            {isBest && (
                                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    BEST
                                </div>
                            )}

                            <div className="mb-4">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{offer.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{offer.country}</p>
                            </div>

                            <div className="mb-4">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                    ${Math.round(outcome.netAfterDebtsAudMonthly).toLocaleString()}
                                </div>
                                {!isBaseline && (
                                    <div className={`text-sm font-semibold ${delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {delta > 0 ? '+' : ''}{delta > 0 ? '$' : '-$'}{Math.abs(Math.round(delta)).toLocaleString()}/mo vs baseline
                                    </div>
                                )}
                            </div>

                            {/* Circular Quality Score */}
                            <div className="flex items-center gap-4 mb-3">
                                <div className="relative w-16 h-16">
                                    <svg className="w-16 h-16 transform -rotate-90">
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            stroke="currentColor"
                                            strokeWidth="6"
                                            fill="none"
                                            className="text-gray-200 dark:text-gray-700"
                                        />
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            stroke="currentColor"
                                            strokeWidth="6"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 28}`}
                                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - outcome.qualityScore / 100)}`}
                                            className={`transition-all duration-500 ${outcome.qualityScore >= 80 ? 'text-emerald-500' :
                                                outcome.qualityScore >= 60 ? 'text-blue-500' :
                                                    outcome.qualityScore >= 40 ? 'text-yellow-500' :
                                                        'text-red-500'
                                                }`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{outcome.qualityScore}</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quality Score</div>
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{verdict}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 3) VISUAL DELTA STRIP */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">Net Income Comparison</h3>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setShowDeltaAnnual(false)}
                            className={`px-3 py-1 rounded text-sm font-medium transition ${!showDeltaAnnual ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' : 'text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setShowDeltaAnnual(true)}
                            className={`px-3 py-1 rounded text-sm font-medium transition ${showDeltaAnnual ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' : 'text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            Annual
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {selectedOffers.map(offer => {
                        const outcome = outcomes[offer.id];
                        const value = showDeltaAnnual
                            ? outcome.netAfterDebtsAudMonthly * 12
                            : outcome.netAfterDebtsAudMonthly;
                        const maxValue = Math.max(...selectedOffers.map(o =>
                            showDeltaAnnual ? outcomes[o.id].netAfterDebtsAudMonthly * 12 : outcomes[o.id].netAfterDebtsAudMonthly
                        ));
                        const width = (value / maxValue) * 100;
                        const isBest = offer.id === recommendedOffer.id;

                        return (
                            <div key={offer.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{offer.name}</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        ${Math.round(value).toLocaleString()}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-500 ${isBest
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                                            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                            }`}
                                        style={{ width: `${width}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 4) ENHANCED OFFER CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedOffers.map(offer => {
                    const outcome = outcomes[offer.id];
                    const isBaseline = offer.id === baselineId;
                    const isBestCashflow = offer.id === bestCashflow.id;
                    const isBestQuality = offer.id === bestQuality.id;

                    // Determine risk level
                    const riskLevel = outcome.verdict.label === 'High Risk' ? 'high' :
                        outcome.verdict.label === 'Not Worth It' ? 'high' :
                            outcome.verdict.label === 'Marginal' ? 'medium' : 'low';

                    return (
                        <OfferCard
                            key={offer.id}
                            offer={offer}
                            outcome={outcome}
                            isBaseline={isBaseline}
                            isBestCashflow={isBestCashflow}
                            isBestQuality={isBestQuality}
                            riskLevel={riskLevel}
                        />
                    );
                })}
            </div>

            {/* 5) DECISION CONFIDENCE (Bottom) */}
            <DecisionConfidence selectedOffers={selectedOffers} outcomes={outcomes} bestCashflow={bestCashflow} />
        </div >
    );
}

function MetricRow({ label, value, negative, bold }) {
    return (
        <div className="flex justify-between items-center">
            <span className={`text-sm ${bold ? 'font-bold' : ''} text-gray-600 dark:text-gray-400`}>{label}:</span>
            <span className={`text-sm ${bold ? 'font-bold text-lg' : ''} ${negative ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {value}
            </span>
        </div>
    );
}

//Enhanced Offer Card Component
function OfferCard({ offer, outcome, isBaseline, isBestCashflow, isBestQuality, riskLevel }) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200">
            {/* Header */}
            <div className="mb-4">
                <h4 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                    <Globe className="w-5 h-5 text-gray-400" />
                    {offer.name}
                </h4>

                <div className="flex flex-wrap gap-1.5 mt-2">
                    {isBaseline && <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">Baseline</span>}
                    {isBestCashflow && <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">💰 Best Cash</span>}
                    {isBestQuality && <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">⭐ Best</span>}
                </div>
            </div>

            {/* Big Metric */}
            <div className="mb-5">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    ${Math.round(outcome.netAfterDebtsAudMonthly).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">net after debts/mo</div>
            </div>

            {/* Compact Rows with Icons */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Runway</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{Math.round(outcome.runwayMonths)}mo</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Savings</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{Math.round(outcome.savingsRatePct)}%</div>
                    </div>
                </div>
            </div>

            {/* Circular Quality Score Ring */}
            <div className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                            cx="40"
                            cy="40"
                            r="35"
                            stroke="currentColor"
                            strokeWidth="7"
                            fill="none"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                            cx="40"
                            cy="40"
                            r="35"
                            stroke="currentColor"
                            strokeWidth="7"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 35}`}
                            strokeDashoffset={`${2 * Math.PI * 35 * (1 - outcome.qualityScore / 100)}`}
                            className={`transition-all duration-700 ${outcome.qualityScore >= 80 ? 'text-emerald-500' :
                                outcome.qualityScore >= 60 ? 'text-blue-500' :
                                    outcome.qualityScore >= 40 ? 'text-yellow-500' :
                                        'text-red-500'
                                }`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">{outcome.qualityScore}</span>
                    </div>
                </div>

                <div className="flex-1 ml-4">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quality Score</div>
                    {/* Risk Pill */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${riskLevel === 'low' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                        riskLevel === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                        {riskLevel === 'low' ? '🟢' : riskLevel === 'medium' ? '🟡' : '🔴'}
                        {riskLevel === 'low' ? 'Low Risk' : riskLevel === 'medium' ? 'Medium Risk' : 'High Risk'}
                    </div>
                </div>
            </div>

            {/* Why this wins/loses - Collapsible */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
                >
                    <span>Why this {outcome.verdict.label === 'Strong Upgrade' ? 'wins' : 'loses'}</span>
                    <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {showDetails && (
                    <div className="mt-3 space-y-1.5 text-sm text-gray-600 dark:text-gray-400 animate-in">
                        {outcome.verdict.reasons.slice(0, 3).map((reason, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <span className="text-gray-400">•</span>
                                <span>{reason}</span>
                            </div>
                        ))}
                        {offer.benefits && offer.benefits.length > 0 && (
                            <div className="flex items-start gap-2 text-emerald-600 dark:text-emerald-400">
                                <span>+</span>
                                <span>{offer.benefits[0]}</span>
                            </div>
                        )}
                        {offer.risks && offer.risks.length > 0 && (
                            <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                                <span>−</span>
                                <span>{offer.risks[0]}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Decision Confidence Component
function DecisionConfidence({ selectedOffers, outcomes, bestCashflow }) {
    // Compute confidence
    const values = selectedOffers.map(o => outcomes[o.id].netAfterDebtsAudMonthly).sort((a, b) => b - a);
    const spread = values.length >= 2 ? ((values[0] - values[1]) / values[0]) * 100 : 0;

    // Base confidence on spread
    let confidence = 50;
    if (spread > 30) confidence = 90;
    else if (spread > 20) confidence = 80;
    else if (spread > 10) confidence = 70;
    else if (spread > 5) confidence = 60;

    // Adjust for quality scores
    const bestOutcome = outcomes[bestCashflow.id];
    if (bestOutcome.qualityScore >= 80) confidence += 5;
    if (bestOutcome.runwayMonths >= 12) confidence += 5;

    confidence = Math.min(95, confidence);

    let explanation = "";
    if (confidence >= 85) explanation = "Large cashflow gap with manageable risk";
    else if (confidence >= 70) explanation = "Clear winner with moderate advantages";
    else if (confidence >= 55) explanation = "Close comparison, consider personal priorities";
    else explanation = "Very close call, all offers have trade-offs";

    return (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Decision Confidence</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{explanation}</p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{confidence}%</div>
                </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700"
                    style={{ width: `${confidence}%` }}
                />
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                <Shield className="w-4 h-4 inline mr-1" />
                Based on offer spread, quality metrics, and risk factors
            </div>
        </div>
    );
}

// Export Tab Component
function ExportTab({ relocation, selectedOffers, outcomes }) {
    const [copied, setCopied] = React.useState(false);

    const exportData = {
        offers: selectedOffers,
        assumptions: relocation.assumptions,
        outcomes: selectedOffers.reduce((acc, offer) => {
            acc[offer.id] = outcomes[offer.id];
            return acc;
        }, {}),
        exportedAt: new Date().toISOString()
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relocation-offers-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Export Selected Offers</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                    Export your selected offers and their computed outcomes as JSON for backup or sharing.
                </p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                    <Download className="w-4 h-4" />
                    Download JSON
                </button>
            </div>

            <div className="bg-gray-900 dark:bg-black rounded-xl p-4 overflow-auto max-h-96">
                <pre className="text-xs text-gray-300 dark:text-gray-400">
                    {JSON.stringify(exportData, null, 2)}
                </pre>
            </div>
        </div>
    );
}

