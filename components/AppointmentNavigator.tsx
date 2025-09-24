
import React from 'react';
import type { Client } from '../types';
import { PlusCircleIcon } from './Icons';

interface AppointmentNavigatorProps {
  client: Client;
  selectedAppointmentId: string;
  onSelectAppointment: (appointmentId: string) => void;
  onNewAppointment: () => void;
}

const AppointmentNavigator: React.FC<AppointmentNavigatorProps> = ({ client, selectedAppointmentId, onSelectAppointment, onNewAppointment }) => {
  const sortedAppointments = [...client.appointments].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
                <span className="text-sm font-medium text-colibri-gray-600 mr-2 flex-shrink-0">Appuntamenti:</span>
                <div className="flex space-x-2">
                    {sortedAppointments.map((appt, index) => {
                        const isSelected = appt.id === selectedAppointmentId;
                        const isLatest = index === 0;
                        const buttonClass = isSelected 
                            ? 'bg-colibri-blue text-white shadow-sm' 
                            : 'bg-colibri-gray-200 text-colibri-gray-700 hover:bg-colibri-gray-300';
                        return (
                            <button 
                                key={appt.id} 
                                onClick={() => onSelectAppointment(appt.id)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${buttonClass}`}
                            >
                                {appt.date.toLocaleDateString('it-IT')}
                                {isLatest && <span className="ml-2 text-xs font-normal opacity-80">(Più recente)</span>}
                            </button>
                        );
                    })}
                </div>
            </div>
            <button 
                onClick={onNewAppointment}
                className="mt-4 sm:mt-0 flex-shrink-0 flex items-center text-colibri-green hover:text-green-700 transition-colors font-medium py-2 px-4 rounded-lg bg-green-50 hover:bg-green-100"
            >
                <PlusCircleIcon />
                <span className="ml-2">Nuovo Appuntamento</span>
            </button>
        </div>
    </div>
  );
};

export default AppointmentNavigator;
