import React, { useMemo, useCallback, useState } from 'react';
import type { Client, SemesterData, ChartDataPoint, Appointment } from '../types';
import PlanChart from './PlanChart';
import { RefreshCwIcon, PencilIcon } from './Icons';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

const getFinancialMetrics = (appointment: Appointment) => {
    const { financialData } = appointment;
    const generalLiquidity = financialData.assets.filter(a => a.type === 'Liquidità' || a.type === 'Altro').reduce((sum, a) => sum + a.amount, 0);
    const consultantLiquidity = financialData.assets.filter(a => a.type === 'Liquidità in Consulenza').reduce((sum, a) => sum + a.amount, 0);
    const portfolioValue = financialData.assets.filter(a => a.type === 'Capitale in Consulenza').reduce((sum, a) => sum + a.amount, 0);
    const externalSecuritiesValue = financialData.assets.filter(a => a.type === 'Capitale Mobiliare').reduce((sum, a) => sum + a.amount, 0);
    const totalIncome = financialData.income.filter(i => i.type === 'Reddito Netto').reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = financialData.income.filter(i => i.type === 'Spesa Media').reduce((sum, item) => sum + item.amount, 0);
    const annualSavings = totalIncome - totalExpenses;
    
    return { generalLiquidity, consultantLiquidity, portfolioValue, externalSecuritiesValue, annualSavings };
};

const TenYearPlan: React.FC<{ client: Client, onUpdate: (client: Client) => void }> = ({ client, onUpdate }) => {
    const [editingChangeId, setEditingChangeId] = useState<string | null>(null);
    
    const sortedAppointments = useMemo(() => {
        if (!client || client.appointments.length === 0) return [];
        return [...client.appointments].sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [client.appointments]);

    const latestExternalSecurities = useMemo(() => {
        const latestAppointment = sortedAppointments[sortedAppointments.length - 1];
        if (!latestAppointment) return [];
        return latestAppointment.financialData.assets.filter(a => a.type === 'Capitale Mobiliare');
    }, [sortedAppointments]);

    const handlePlanDataChange = <K extends keyof Client['planData'],>(field: K, value: Client['planData'][K]) => {
        onUpdate({
            ...client,
            planData: { ...client.planData, [field]: value }
        });
    };
    
     const handleExternalReturnChange = (assetId: string, value: string) => {
        const newReturns = { ...(client.planData.externalAssetReturns || {}) };
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
            newReturns[assetId] = parsedValue;
        } else {
            delete newReturns[assetId];
        }
        handlePlanDataChange('externalAssetReturns', newReturns);
    };

    const handleSemesterChange = (id: string, field: keyof SemesterData, value: any) => {
        const existingOverrides = client.planData.semesters;
        const existingIndex = existingOverrides.findIndex(s => s.id === id);
        const updatedOverrides = [...existingOverrides];

        let parsedValue: number | undefined;
        if (field === 'change' || field === 'savings' || field === 'consultantLiquidityOverride' || field === 'portfolioOverride') {
            const numValue = parseFloat(value);
            parsedValue = isNaN(numValue) ? undefined : numValue;
        }

        if (existingIndex > -1) {
            const updatedSemester = { ...updatedOverrides[existingIndex], [field]: parsedValue };
            
            const hasValues = Object.entries(updatedSemester)
                .some(([key, val]) => key !== 'id' && val !== undefined && (typeof val !== 'object' || (val && Object.keys(val).length > 0)));


            if (hasValues) {
                updatedOverrides[existingIndex] = updatedSemester;
            } else {
                 updatedOverrides.splice(existingIndex, 1);
            }
        } else if (parsedValue !== undefined) {
             updatedOverrides.push({ id, [field]: parsedValue } as SemesterData);
        }
        
        handlePlanDataChange('semesters', updatedOverrides);
    };
    
    const handleExternalCapitalOverrideChange = (semesterId: string, assetId: string, value: string) => {
        const existingOverrides = client.planData.semesters;
        const existingIndex = existingOverrides.findIndex(s => s.id === semesterId);
        const updatedOverrides = [...existingOverrides];
        const parsedValue = parseFloat(value);
        const hasValue = !isNaN(parsedValue);

        if (existingIndex > -1) {
            const existingSemester = updatedOverrides[existingIndex];
            const newExternalOverrides = { ...(existingSemester.externalCapitalOverrides || {}) };

            if (hasValue) {
                newExternalOverrides[assetId] = parsedValue;
            } else {
                delete newExternalOverrides[assetId];
            }

            const updatedSemester = {
                ...existingSemester,
                externalCapitalOverrides: newExternalOverrides
            };

            if (Object.keys(updatedSemester.externalCapitalOverrides).length === 0) {
                delete updatedSemester.externalCapitalOverrides;
            }
            
            const hasOtherValues = Object.entries(updatedSemester)
                .some(([key, val]) => key !== 'id' && val !== undefined && (typeof val !== 'object' || (val && Object.keys(val).length > 0)));


            if (hasOtherValues) {
                updatedOverrides[existingIndex] = updatedSemester;
            } else {
                updatedOverrides.splice(existingIndex, 1);
            }

        } else if (hasValue) {
            updatedOverrides.push({
                id: semesterId,
                externalCapitalOverrides: { [assetId]: parsedValue }
            });
        }
        
        handlePlanDataChange('semesters', updatedOverrides);
    };


    const { planData } = client;

    const fullPlanData = useMemo(() => {
        if (sortedAppointments.length === 0) return [];

        const data: ChartDataPoint[] = [];
        
        // Process historical appointments
        sortedAppointments.forEach((appt, index) => {
            const { generalLiquidity, consultantLiquidity, portfolioValue } = getFinancialMetrics(appt);
            
            const externalCapitalValues: { [assetId: string]: number } = {};
            const allExternalAssets = appt.financialData.assets.filter(a => a.type === 'Capitale Mobiliare');
            allExternalAssets.forEach(asset => {
                externalCapitalValues[asset.id] = asset.amount;
            });
            const externalSecuritiesValue = allExternalAssets.reduce((sum, a) => sum + a.amount, 0);
            
            const override = client.planData.semesters.find(s => s.id === appt.id);
            const periodChange = (index > 0) ? (override?.change ?? 0) : 0;

            let finalGeneralLiquidity = generalLiquidity;
            let finalConsultantLiquidity = consultantLiquidity;
            let finalPortfolioValue = portfolioValue;
            let portfolioCapitalChange = 0;
            
            if (periodChange > 0) { // Investment
                let amountToInvest = periodChange;
                
                const fromConsultant = Math.min(amountToInvest, finalConsultantLiquidity);
                finalConsultantLiquidity -= fromConsultant;
                amountToInvest -= fromConsultant;

                if (amountToInvest > 0) {
                    finalGeneralLiquidity -= amountToInvest;
                }
                
                finalPortfolioValue += periodChange;
                portfolioCapitalChange = periodChange;
                
            } else if (periodChange < 0) { // Withdrawal
                let amountToWithdraw = Math.abs(periodChange);
                
                const fromConsultantLiq = Math.min(amountToWithdraw, finalConsultantLiquidity);
                finalConsultantLiquidity -= fromConsultantLiq;
                amountToWithdraw -= fromConsultantLiq;

                const fromPortfolio = Math.min(amountToWithdraw, finalPortfolioValue);
                finalPortfolioValue -= fromPortfolio;
                portfolioCapitalChange = -fromPortfolio;

                const totalWithdrawn = fromConsultantLiq + fromPortfolio;
                finalGeneralLiquidity += totalWithdrawn;
            }
            
            let periodSavings = 0;
            let runningCapitaleVersato = 0;
            let rendimenti = 0;

            if (index === 0) {
                runningCapitaleVersato = finalPortfolioValue;
            } else {
                const prevDataPoint = data[index - 1];
                runningCapitaleVersato = prevDataPoint.capitaleVersato + portfolioCapitalChange;
                rendimenti = finalPortfolioValue - runningCapitaleVersato;
            }

            data.push({
                date: appt.date.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
                timestamp: appt.date.getTime(),
                generalLiquidity: finalGeneralLiquidity,
                consultantLiquidity: finalConsultantLiquidity,
                totalLiquidity: finalGeneralLiquidity + finalConsultantLiquidity,
                capitaleVersato: runningCapitaleVersato,
                rendimenti,
                portafoglio: finalPortfolioValue,
                externalCapital: externalSecuritiesValue,
                externalCapitalValues,
                capitaleTotale: finalGeneralLiquidity + finalConsultantLiquidity + finalPortfolioValue + externalSecuritiesValue,
                isProjection: false,
                periodChange,
                periodSavings,
            });
        });

        const lastAppointment = sortedAppointments[sortedAppointments.length - 1];
        const lastDataPoint = data[data.length - 1];

        const { annualSavings: latestAnnualSavings } = getFinancialMetrics(lastAppointment);
        const semiAnnualSavings = latestAnnualSavings / 2;
        const semiAnnualReturn = Math.pow(1 + planData.annualReturn / 100, 0.5) - 1;

        let currentGeneralLiquidity = lastDataPoint.generalLiquidity;
        let currentConsultantLiquidity = lastDataPoint.consultantLiquidity;
        let currentPortfolioValue = lastDataPoint.portafoglio;
        let currentCapitaleVersato = lastDataPoint.capitaleVersato;
        let currentExternalValues = { ...lastDataPoint.externalCapitalValues };

        Array.from({ length: 20 }).forEach((_, i) => {
            const semesterDate = new Date(lastAppointment.date);
            semesterDate.setMonth(semesterDate.getMonth() + (i + 1) * 6);
            const semesterId = `future-sem-${i}`;
            const override = client.planData.semesters.find(s => s.id === semesterId);
            
            const savings = override?.savings ?? semiAnnualSavings;
            const change = override?.change ?? savings;
            const consultantLiquidityOverride = override?.consultantLiquidityOverride;
            const portfolioOverride = override?.portfolioOverride;
            
            const returns = currentPortfolioValue * semiAnnualReturn;
            currentPortfolioValue += returns;
            currentGeneralLiquidity += savings;

            let nextExternalValues = { ...currentExternalValues };
            for (const assetId in currentExternalValues) {
                const assetOverride = override?.externalCapitalOverrides?.[assetId];
                if(assetOverride !== undefined) {
                    nextExternalValues[assetId] = assetOverride;
                } else {
                    const assetReturnRate = planData.externalAssetReturns?.[assetId] ?? 0;
                    const semiAnnualAssetReturn = Math.pow(1 + assetReturnRate / 100, 0.5) - 1;
                    const growth = currentExternalValues[assetId] * semiAnnualAssetReturn;
                    nextExternalValues[assetId] += growth;
                }
            }
            currentExternalValues = nextExternalValues;
            const currentTotalExternalValue = Object.values(currentExternalValues).reduce((a, b) => a + b, 0);

            const investmentAmount = change;

            if (investmentAmount > 0) {
                let amountToInvest = investmentAmount;
                const fromConsultant = Math.min(amountToInvest, currentConsultantLiquidity);
                currentConsultantLiquidity -= fromConsultant;
                currentPortfolioValue += fromConsultant;
                currentCapitaleVersato += fromConsultant;
                amountToInvest -= fromConsultant;

                if (amountToInvest > 0) {
                    const fromGeneral = amountToInvest;
                    currentGeneralLiquidity -= fromGeneral;
                    currentPortfolioValue += fromGeneral;
                    currentCapitaleVersato += fromGeneral;
                }
            } else if (investmentAmount < 0) {
                let amountToWithdraw = Math.abs(investmentAmount);
                
                const fromConsultantLiq = Math.min(amountToWithdraw, currentConsultantLiquidity);
                currentConsultantLiquidity -= fromConsultantLiq;
                amountToWithdraw -= fromConsultantLiq;

                const fromPortfolio = Math.min(amountToWithdraw, currentPortfolioValue);
                currentPortfolioValue -= fromPortfolio;
                currentCapitaleVersato = Math.max(0, currentCapitaleVersato - fromPortfolio);

                const totalWithdrawn = fromConsultantLiq + fromPortfolio;
                currentGeneralLiquidity += totalWithdrawn;
            }
            
            if (consultantLiquidityOverride !== undefined) {
                const delta = consultantLiquidityOverride - currentConsultantLiquidity;
                currentConsultantLiquidity = consultantLiquidityOverride;
                currentPortfolioValue -= delta;
                 currentCapitaleVersato -= delta;
            }

            if (portfolioOverride !== undefined) {
                currentPortfolioValue = portfolioOverride;
            }

            const rendimenti = currentPortfolioValue - currentCapitaleVersato;

            data.push({
                date: semesterDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
                timestamp: semesterDate.getTime(),
                generalLiquidity: currentGeneralLiquidity,
                consultantLiquidity: currentConsultantLiquidity,
                totalLiquidity: currentGeneralLiquidity + currentConsultantLiquidity,
                capitaleVersato: currentCapitaleVersato,
                rendimenti,
                portafoglio: currentPortfolioValue,
                externalCapital: currentTotalExternalValue,
                externalCapitalValues: { ...currentExternalValues },
                capitaleTotale: currentGeneralLiquidity + currentConsultantLiquidity + currentPortfolioValue + currentTotalExternalValue,
                isProjection: true,
                periodChange: change,
                periodSavings: savings,
            });
        });

        return data;
    }, [sortedAppointments, client.planData, latestExternalSecurities]);
    
    const resetPlan = useCallback(() => {
        onUpdate({
            ...client,
            planData: {
                ...client.planData,
                semesters: client.planData.semesters.filter(s => sortedAppointments.some(a => a.id === s.id)),
            }
        });
    }, [client, onUpdate, sortedAppointments]);


    if (sortedAppointments.length === 0) {
        return <div className="bg-white p-6 rounded-xl shadow-lg mt-8">Nessun appuntamento disponibile per la pianificazione.</div>;
    }
    
    const baseInputClass = "w-full bg-white border border-colibri-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-colibri-green focus:border-colibri-green placeholder-colibri-gray-400";

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-colibri-gray-800">Pianificazione Storica e Futura</h2>
                 <button onClick={resetPlan} className="flex items-center text-sm font-medium text-colibri-blue hover:text-blue-700 transition-colors">
                    <RefreshCwIcon />
                    <span className="ml-2">Reset Piano Futuro</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-colibri-gray-50 p-4 rounded-lg space-y-4">
                     <div>
                        <label htmlFor="annualReturn" className="block text-sm font-medium text-colibri-gray-700">Rend. Medio Annuo Portafoglio Consulenza (%)</label>
                        <input
                            type="number"
                            id="annualReturn"
                            value={planData.annualReturn}
                            onChange={(e) => handlePlanDataChange('annualReturn', parseFloat(e.target.value) || 0)}
                            className="mt-1 block w-full border border-colibri-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-colibri-green focus:border-colibri-green"
                        />
                    </div>
                    {latestExternalSecurities.map(asset => (
                        <div key={asset.id}>
                            <label htmlFor={`ext-return-${asset.id}`} className="block text-sm font-medium text-colibri-gray-700">Rend. {asset.description} ({asset.details}) (%)</label>
                             <input
                                type="number"
                                id={`ext-return-${asset.id}`}
                                value={planData.externalAssetReturns?.[asset.id] ?? ''}
                                placeholder="0"
                                onChange={(e) => handleExternalReturnChange(asset.id, e.target.value)}
                                className="mt-1 block w-full border border-colibri-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-colibri-green focus:border-colibri-green"
                            />
                        </div>
                    ))}
                </div>
                <div className="bg-colibri-gray-50 p-4 rounded-lg">
                    <label htmlFor="minLiquidity" className="block text-sm font-medium text-colibri-gray-700">Liquidità Minima di Emergenza (€)</label>
                    <input
                        type="number"
                        id="minLiquidity"
                        step="1000"
                        value={planData.minLiquidity}
                        onChange={(e) => handlePlanDataChange('minLiquidity', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full border border-colibri-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-colibri-green focus:border-colibri-green"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-8">
                <div className="w-full h-[500px] bg-colibri-gray-50 p-4 rounded-lg">
                    <PlanChart data={fullPlanData} projectionStartIndex={sortedAppointments.length} />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-colibri-gray-200 text-sm">
                        <thead className="bg-colibri-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="px-2 py-3 text-left text-xs font-semibold text-colibri-gray-600 uppercase tracking-wider">Data</th>
                                <th className="px-2 py-3 text-left text-xs font-semibold text-colibri-gray-600 uppercase tracking-wider">Risparmio Sem.</th>
                                <th className="px-2 py-3 text-left text-xs font-semibold text-colibri-gray-600 uppercase tracking-wider">Vers./Prel. Extra</th>
                                <th className="px-2 py-3 text-left text-xs font-semibold text-colibri-gray-600 uppercase tracking-wider">Liq. Generale</th>
                                <th className="px-2 py-3 text-left text-xs font-semibold text-colibri-gray-600 uppercase tracking-wider">Liq. Consulenza</th>
                                {latestExternalSecurities.map(asset => (
                                    <th key={asset.id} className="px-2 py-3 text-left text-xs font-semibold text-colibri-gray-600 uppercase tracking-wider whitespace-nowrap" title={asset.details}>
                                        {asset.description}
                                    </th>
                                ))}
                                <th className="px-2 py-3 text-left text-xs font-semibold text-colibri-gray-600 uppercase tracking-wider">Valore Portafoglio</th>
                                <th className="px-2 py-3 text-left text-xs font-semibold text-colibri-gray-600 uppercase tracking-wider">Rendimenti Cum.</th>
                                <th className="px-2 py-3 text-left text-xs font-semibold text-colibri-gray-600 uppercase tracking-wider">Cap. Totale</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-colibri-gray-200">
                             {fullPlanData.map((dataPoint, index) => {
                                const generalLiquidityClass = `px-2 py-2 whitespace-nowrap rounded-md ${
                                    dataPoint.generalLiquidity < 0 
                                        ? 'bg-red-100 text-red-800 font-bold' 
                                        : (dataPoint.generalLiquidity < planData.minLiquidity)
                                            ? 'bg-red-50 text-red-700' 
                                            : 'text-colibri-gray-600'
                                }`;
                                const isFirst = index === 0;
                                const appointmentId = sortedAppointments[index]?.id;
                                const semesterId = `future-sem-${index - sortedAppointments.length}`;
                                
                                if (!dataPoint.isProjection) {
                                     const historicalOverride = client.planData.semesters.find(s => s.id === appointmentId);
                                     const isEditingChange = editingChangeId === appointmentId;
                                    return (
                                        <tr key={appointmentId} className={isFirst ? "bg-green-50" : "bg-blue-50"}>
                                            <td className="px-2 py-3 font-medium">{dataPoint.date}</td>
                                            <td className="px-2 py-3 text-colibri-gray-500">{isFirst ? 'N/A' : formatCurrency(dataPoint.periodSavings || 0)}</td>
                                            <td className="px-2 py-2">
                                                {isFirst ? (
                                                    <span className="text-colibri-gray-500 pl-2">N/A</span>
                                                ) : isEditingChange ? (
                                                    <input
                                                        type="number"
                                                        step="100"
                                                        value={historicalOverride?.change ?? ''}
                                                        placeholder="0"
                                                        onChange={(e) => handleSemesterChange(appointmentId, 'change', e.target.value)}
                                                        onBlur={() => setEditingChangeId(null)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditingChangeId(null); }}
                                                        autoFocus
                                                        className={`${baseInputClass} w-24`}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-between w-24 pr-1 h-full">
                                                        <span>{formatCurrency(historicalOverride?.change ?? 0)}</span>
                                                        <button
                                                            onClick={() => setEditingChangeId(appointmentId)}
                                                            className="text-colibri-gray-400 hover:text-colibri-blue p-1 rounded-full group"
                                                            aria-label="Modifica versamento/prelievo"
                                                        >
                                                            <PencilIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className={generalLiquidityClass}>{formatCurrency(dataPoint.generalLiquidity)}</td>
                                            <td className="px-2 py-3">{formatCurrency(dataPoint.consultantLiquidity)}</td>
                                            {latestExternalSecurities.map(asset => (
                                                <td key={asset.id} className="px-2 py-3 text-indigo-600 whitespace-nowrap">
                                                    {formatCurrency(dataPoint.externalCapitalValues[asset.id] ?? 0)}
                                                </td>
                                            ))}
                                            <td className="px-2 py-3 font-semibold">{formatCurrency(dataPoint.portafoglio)}</td>
                                            <td className="px-2 py-3 text-colibri-green font-medium">{formatCurrency(dataPoint.rendimenti)}</td>
                                            <td className="px-2 py-3 font-bold text-colibri-blue">{formatCurrency(dataPoint.capitaleTotale)}</td>
                                        </tr>
                                    );
                                } else {
                                    const futureOverride = client.planData.semesters.find(s => s.id === semesterId);
                                    return (
                                        <tr key={semesterId}>
                                            <td className="px-2 py-2 whitespace-nowrap text-colibri-gray-500">{dataPoint.date}</td>
                                             <td className="px-2 py-2 whitespace-nowrap">
                                                <input type="number" step="100" value={futureOverride?.savings ?? ''} placeholder={dataPoint.periodSavings?.toFixed(0)} onChange={e => handleSemesterChange(semesterId, 'savings', e.target.value)} className={`${baseInputClass} w-24`} />
                                            </td>
                                            <td className="px-2 py-2 whitespace-nowrap">
                                                <input type="number" step="100" value={futureOverride?.change ?? ''} placeholder={dataPoint.periodChange?.toFixed(0)} onChange={e => handleSemesterChange(semesterId, 'change', e.target.value)} className={`${baseInputClass} w-24`} />
                                            </td>
                                            <td className={generalLiquidityClass}>{formatCurrency(dataPoint.generalLiquidity)}</td>
                                             <td className="px-2 py-2 whitespace-nowrap">
                                                <input type="number" step="100" value={futureOverride?.consultantLiquidityOverride ?? ''} placeholder={dataPoint.consultantLiquidity.toFixed(0)} onChange={e => handleSemesterChange(semesterId, 'consultantLiquidityOverride', e.target.value)} className={`${baseInputClass} w-28`} />
                                             </td>
                                            {latestExternalSecurities.map(asset => (
                                                <td key={asset.id} className="px-2 py-2 whitespace-nowrap text-indigo-600">
                                                    <input
                                                        type="number"
                                                        step="100"
                                                        value={futureOverride?.externalCapitalOverrides?.[asset.id] ?? ''}
                                                        placeholder={dataPoint.externalCapitalValues[asset.id]?.toFixed(0)}
                                                        onChange={e => handleExternalCapitalOverrideChange(semesterId, asset.id, e.target.value)}
                                                        className={`${baseInputClass} w-28`}
                                                    />
                                                </td>
                                            ))}
                                            <td className="px-2 py-2 whitespace-nowrap">
                                                 <input
                                                    type="number"
                                                    step="100"
                                                    value={futureOverride?.portfolioOverride ?? ''}
                                                    placeholder={dataPoint.portafoglio.toFixed(0)}
                                                    onChange={e => handleSemesterChange(semesterId, 'portfolioOverride', e.target.value)}
                                                    className={`${baseInputClass} w-28 font-semibold`}
                                                />
                                            </td>
                                            <td className="px-2 py-2 whitespace-nowrap text-colibri-green">{formatCurrency(dataPoint.rendimenti)}</td>
                                            <td className="px-2 py-2 whitespace-nowrap font-bold text-colibri-blue">{formatCurrency(dataPoint.capitaleTotale)}</td>
                                        </tr>
                                    );
                                }
                             })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TenYearPlan;