import React, { useState, useEffect } from 'react';
import type { Client } from '../types';
import { PencilIcon, TrashIcon } from './Icons';

interface ClientDetailsProps {
    client: Client;
    onUpdate: (name: string, dob?: Date) => void;
    onDelete: () => void;
}

const formatDateForInput = (date?: Date) => {
    if (!date || isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

const calculateAge = (dob?: Date): number | null => {
    if (!dob) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(client.name);
    const [dob, setDob] = useState(client.dob);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    useEffect(() => {
        setName(client.name);
        setDob(client.dob);
        setIsEditing(false);
        setIsConfirmingDelete(false);
    }, [client]);

    const handleSave = () => {
        onUpdate(name, dob);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setName(client.name);
        setDob(client.dob);
        setIsEditing(false);
    };
    
    const handleConfirmDelete = () => {
        onDelete();
        setIsConfirmingDelete(false);
    };

    const age = calculateAge(client.dob);

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg">
            {!isEditing ? (
                <div className="flex items-center justify-between min-h-[40px]">
                    <div className="flex items-baseline space-x-4">
                         <h2 className="text-2xl font-bold text-colibri-gray-800">{client.name}</h2>
                         {age !== null && <span className="text-lg text-colibri-gray-600">({age} anni)</span>}
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setIsEditing(true)} className="flex items-center text-sm font-medium text-colibri-blue hover:text-blue-700 transition-colors">
                            <PencilIcon className="h-4 w-4" />
                            <span className="ml-2">Modifica Dati</span>
                        </button>
                         {!isConfirmingDelete ? (
                            <button onClick={() => setIsConfirmingDelete(true)} className="flex items-center text-sm font-medium text-colibri-red hover:text-red-700 transition-colors">
                                <TrashIcon className="h-4 w-4" />
                                <span className="ml-2">Elimina Cliente</span>
                            </button>
                        ) : (
                            <div className="flex items-center space-x-2 p-2 rounded-lg bg-red-50 ring-1 ring-red-200">
                                <span className="text-sm font-medium text-red-900">Sei sicuro?</span>
                                <button onClick={handleConfirmDelete} className="px-3 py-1 text-sm font-medium text-white bg-colibri-red hover:bg-red-800 rounded-md transition-colors">
                                    Conferma
                                </button>
                                <button onClick={() => setIsConfirmingDelete(false)} className="px-3 py-1 text-sm font-medium text-colibri-gray-700 bg-white hover:bg-colibri-gray-100 rounded-md border border-colibri-gray-300 transition-colors">
                                    Annulla
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="clientName" className="block text-sm font-medium text-colibri-gray-700">Nome Cliente</label>
                            <input
                                type="text"
                                id="clientName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-colibri-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-colibri-green focus:border-colibri-green"
                            />
                        </div>
                        <div>
                            <label htmlFor="clientDob" className="block text-sm font-medium text-colibri-gray-700">Data di Nascita</label>
                             <input
                                type="date"
                                id="clientDob"
                                value={formatDateForInput(dob)}
                                onChange={(e) => setDob(e.target.value ? new Date(e.target.value) : undefined)}
                                className="mt-1 block w-full border border-colibri-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-colibri-green focus:border-colibri-green"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-colibri-gray-700 bg-colibri-gray-200 hover:bg-colibri-gray-300 rounded-md transition-colors">
                            Annulla
                        </button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-colibri-blue hover:bg-blue-700 rounded-md transition-colors">
                            Salva Modifiche
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientDetails;