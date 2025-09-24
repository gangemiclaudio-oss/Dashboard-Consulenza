import React, { useMemo, useState, useRef } from 'react';
import type { Appointment, IncomeEntry, AssetEntry, PensionEntry } from '../types';
import { PlusCircleIcon, TrashIcon, DragHandleIcon } from './Icons';

type Entry = IncomeEntry | AssetEntry | PensionEntry;
type EntryType = 'income' | 'assets' | 'pensions';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

const formatDateForInput = (date: Date) => {
    if (!date || isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

interface DataAreaProps<T extends Entry> {
    title: string;
    entries: T[];
    onUpdate: (field: EntryType, updatedEntries: T[]) => void;
    entryType: EntryType;
    options: string[];
    renderRow: (entry: T, index: number, handleEntryChange: (index: number, field: keyof T, value: any) => void) => React.ReactNode;
}

const DataArea = <T extends Entry,>({ title, entries, onUpdate, entryType, options, renderRow }: DataAreaProps<T>) => {
    const [dragging, setDragging] = useState(false);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleEntryChange = (index: number, field: keyof T, value: any) => {
        const updatedEntries = [...entries];
        updatedEntries[index] = { ...updatedEntries[index], [field]: value };
        onUpdate(entryType, updatedEntries);
    };

    const addEntry = () => {
        const newEntry = {
            id: `${entryType}-${Date.now()}`,
            type: options[0],
            description: '',
            amount: 0,
        } as T;
        onUpdate(entryType, [...entries, newEntry]);
    };

    const removeEntry = (index: number) => {
        onUpdate(entryType, entries.filter((_, i) => i !== index));
    };

    const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        dragItem.current = index;
        setDragging(true);
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        dragOverItem.current = index;
    };
    
    const handleDrop = () => {
        if (dragItem.current !== null && dragOverItem.current !== null) {
            const newEntries = [...entries];
            const dragItemContent = newEntries.splice(dragItem.current, 1)[0];
            newEntries.splice(dragOverItem.current, 0, dragItemContent);
            dragItem.current = null;
            dragOverItem.current = null;
            onUpdate(entryType, newEntries);
        }
        setDragging(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-colibri-gray-700 mb-4">{title}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-colibri-gray-200">
                    <thead className="bg-colibri-gray-50">
                        <tr>
                            <th className="px-1 py-2 w-8"></th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-colibri-gray-500 uppercase tracking-wider w-1/4">Voce</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-colibri-gray-500 uppercase tracking-wider w-1/4">Descrizione</th>
                             {entryType === 'assets' && <th className="px-4 py-2 text-left text-xs font-medium text-colibri-gray-500 uppercase tracking-wider">Dettagli</th>}
                            <th className="px-4 py-2 text-left text-xs font-medium text-colibri-gray-500 uppercase tracking-wider">Importo</th>
                             {entryType === 'assets' && <th className="px-4 py-2 text-left text-xs font-medium text-colibri-gray-500 uppercase tracking-wider">Mutuo</th>}
                            <th className="px-4 py-2 text-right text-xs font-medium text-colibri-gray-500 uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-colibri-gray-200" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
                        {entries.map((entry, index) => (
                             <tr 
                                key={entry.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={handleDrop}
                                className={`transition-opacity ${dragging && dragItem.current === index ? 'opacity-50' : ''}`}
                            >
                                <td className="px-1 py-2 text-colibri-gray-400 cursor-grab"><DragHandleIcon /></td>
                                {renderRow(entry, index, handleEntryChange)}
                                <td className="px-4 py-2 whitespace-nowrap text-right">
                                    <button onClick={() => removeEntry(index)} className="text-colibri-red hover:text-red-700">
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <button onClick={addEntry} className="mt-4 flex items-center text-colibri-green hover:text-green-700 transition-colors">
                <PlusCircleIcon />
                <span className="ml-2 font-medium">Aggiungi riga</span>
            </button>
        </div>
    );
};


const FinancialSnapshot: React.FC<{ appointment: Appointment, onUpdate: (appointment: Appointment) => void, isHistorical: boolean }> = ({ appointment, onUpdate, isHistorical }) => {

    const handleUpdate = (field: EntryType, data: any[]) => {
        const updatedAppointment = {
            ...appointment,
            financialData: {
                ...appointment.financialData,
                [field]: data,
            },
        };
        onUpdate(updatedAppointment);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value);
        if(!isNaN(newDate.getTime())) {
            onUpdate({ ...appointment, date: newDate });
        }
    }
    
    const totals = useMemo(() => {
        const { financialData } = appointment;
        const totalIncome = financialData.income.filter(i => i.type === 'Reddito Netto').reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = financialData.income.filter(i => i.type === 'Spesa Media').reduce((sum, item) => sum + item.amount, 0);
        const annualSavings = totalIncome - totalExpenses;

        const totalAssets = financialData.assets.reduce((sum, asset) => sum + asset.amount - (asset.mortgage || 0), 0);
        const totalAssetsExcludingProperty = financialData.assets
            .filter(asset => asset.type !== 'Immobile')
            .reduce((sum, asset) => sum + asset.amount - (asset.mortgage || 0), 0);
            
        return { totalAssets, totalAssetsExcludingProperty, annualSavings };
    }, [appointment]);

    const incomeOptions = ['Reddito Netto', 'Spesa Media', 'Altro'];
    const assetOptions = ['Immobile', 'Capitale Mobiliare', 'Capitale in Consulenza', 'Liquidità', 'Liquidità in Consulenza', 'Altro'];
    const pensionOptions = ['Fondo Pensione', 'TFR', 'Assicurazione Vita', 'Altro'];

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg relative">
            {isHistorical && (
                 <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4" role="alert">
                    <p className="font-bold text-yellow-800">Attenzione</p>
                    <p className="text-sm text-yellow-700">Stai modificando i dati di un appuntamento storico. Le modifiche influenzeranno i calcoli storici e le proiezioni future.</p>
                </div>
            )}
            <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-colibri-gray-800">Fotografia Appuntamento</h2>
                 <div className="flex items-center space-x-2">
                    <label htmlFor="appointmentDate" className="text-sm font-medium text-colibri-gray-600">Data:</label>
                    <input 
                        type="date"
                        id="appointmentDate"
                        value={formatDateForInput(appointment.date)}
                        onChange={handleDateChange}
                        className="bg-white border border-colibri-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-colibri-green focus:border-colibri-green"
                    />
                 </div>
            </div>

            <div className="space-y-6">
                 <div>
                    <DataArea
                        title="Area Reddituale (Annuale)"
                        entries={appointment.financialData.income}
                        onUpdate={handleUpdate}
                        entryType="income"
                        options={incomeOptions}
                        renderRow={(entry, index, handleChange) => (
                            <>
                                <td className="px-4 py-2"><SelectInput options={incomeOptions} value={entry.type} onChange={e => handleChange(index, 'type', e.target.value)} /></td>
                                <td className="px-4 py-2"><TextInput placeholder="Descrizione" value={entry.description} onChange={e => handleChange(index, 'description', e.target.value)} /></td>
                                <td className="px-4 py-2"><NumberInput value={entry.amount} onChange={e => handleChange(index, 'amount', parseFloat(e.target.value) || 0)} /></td>
                            </>
                        )}
                    />
                    <div className="bg-colibri-gray-50 p-4 rounded-b-lg flex justify-end">
                        <div className="text-right">
                            <p className="text-sm text-colibri-gray-500">Risparmio Annuo Stimato</p>
                            <p className="text-xl font-semibold text-colibri-green">{formatCurrency(totals.annualSavings)}</p>
                        </div>
                    </div>
                </div>

                <DataArea
                    title="Area Patrimonio"
                    entries={appointment.financialData.assets}
                    onUpdate={handleUpdate}
                    entryType="assets"
                    options={assetOptions}
                    renderRow={(entry, index, handleChange) => (
                        <>
                            <td className="px-4 py-2"><SelectInput options={assetOptions} value={entry.type} onChange={e => handleChange(index, 'type', e.target.value)} /></td>
                            <td className="px-4 py-2"><TextInput placeholder="Descrizione" value={entry.description} onChange={e => handleChange(index, 'description', e.target.value)} /></td>
                            <td className="px-4 py-2"><TextInput placeholder="Es. Banca, Conto Deposito..." value={(entry as AssetEntry).details || ''} onChange={e => handleChange(index, 'details', e.target.value)} /></td>
                            <td className="px-4 py-2"><NumberInput value={entry.amount} onChange={e => handleChange(index, 'amount', parseFloat(e.target.value) || 0)} /></td>
                            <td className="px-4 py-2"><NumberInput value={(entry as AssetEntry).mortgage || 0} onChange={e => handleChange(index, 'mortgage', parseFloat(e.target.value) || 0)} disabled={entry.type !== 'Immobile'} /></td>
                        </>
                    )}
                />

                <div className="bg-colibri-gray-50 p-4 rounded-lg flex justify-end space-x-8">
                    <div className="text-right">
                        <p className="text-sm text-colibri-gray-500">Totale Patrimonio</p>
                        <p className="text-xl font-semibold text-colibri-gray-800">{formatCurrency(totals.totalAssets)}</p>
                    </div>
                     <div className="text-right">
                        <p className="text-sm text-colibri-gray-500">Totale (esclusi immobili)</p>
                        <p className="text-xl font-semibold text-colibri-gray-800">{formatCurrency(totals.totalAssetsExcludingProperty)}</p>
                    </div>
                </div>

                <DataArea
                    title="Area Previdenziale e Assicurativa"
                    entries={appointment.financialData.pensions}
                    onUpdate={handleUpdate}
                    entryType="pensions"
                    options={pensionOptions}
                    renderRow={(entry, index, handleChange) => (
                         <>
                            <td className="px-4 py-2"><SelectInput options={pensionOptions} value={entry.type} onChange={e => handleChange(index, 'type', e.target.value)} /></td>
                            <td className="px-4 py-2"><TextInput placeholder="Descrizione" value={entry.description} onChange={e => handleChange(index, 'description', e.target.value)} /></td>
                            <td className="px-4 py-2"><NumberInput value={entry.amount} onChange={e => handleChange(index, 'amount', parseFloat(e.target.value) || 0)} /></td>
                        </>
                    )}
                />
            </div>
        </div>
    );
};


// Helper input components
const baseInputClass = "w-full bg-white border border-colibri-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-colibri-green focus:border-colibri-green disabled:bg-colibri-gray-100 disabled:cursor-not-allowed";

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input type="text" {...props} className={baseInputClass} />
);

const NumberInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input type="number" step="100" {...props} className={baseInputClass} />
);

const SelectInput: React.FC<{ options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>> = ({ options, ...props }) => (
    <select {...props} className={baseInputClass}>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
);

export default FinancialSnapshot;