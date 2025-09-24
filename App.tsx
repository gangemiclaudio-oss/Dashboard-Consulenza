import React, { useState, useMemo, useEffect } from 'react';
import type { Client, Appointment } from './types';
import AppointmentNavigator from './components/AppointmentNavigator';
import FinancialSnapshot from './components/FinancialSnapshot';
import TenYearPlan from './components/TenYearPlan';
import ClientDetails from './components/ClientDetails';
import ClientSearchSelector from './components/ClientSearchSelector';
import LoginScreen from './components/LoginScreen';
import { loadClients, saveClients } from './storage';
import { PlusCircleIcon, LogOutIcon } from './components/Icons';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clients, setClients] = useState<Client[]>(loadClients);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  useEffect(() => {
    if (!selectedClientId && clients.length > 0) {
      // If no client is selected (e.g. on first load with data), do nothing.
      // Let the user select a client.
    } else if (!clients.some(c => c.id === selectedClientId)) {
        // If the selected client was deleted, clear the selection
        setSelectedClientId('');
    }
  }, [selectedClientId, clients]);

  const selectedAppointmentId = useMemo(() => {
    if (!selectedClient) return '';
    const latestAppointment = [...selectedClient.appointments].sort((a, b) => b.date.getTime() - a.date.getTime())[0];
    return latestAppointment?.id || '';
  }, [selectedClient]);

  const selectedAppointment = useMemo(() => {
    return selectedClient?.appointments.find(a => a.id === selectedAppointmentId);
  }, [selectedClient, selectedAppointmentId]);
  
  const latestAppointment = useMemo(() => {
    if (!selectedClient) return undefined;
    return [...selectedClient.appointments].sort((a, b) => b.date.getTime() - a.date.getTime())[0];
  }, [selectedClient]);

  const updateClient = (updatedClient: Client) => {
    setClients(prevClients => 
      prevClients.map(c => c.id === updatedClient.id ? updatedClient : c)
    );
  };
  
  const handleNewAppointment = () => {
    if (!selectedClient || !latestAppointment) return;

    const newAppointment: Appointment = {
      id: `appt-${selectedClient.id}-${Date.now()}`,
      date: new Date(),
      financialData: JSON.parse(JSON.stringify(latestAppointment.financialData))
    };

    const updatedClient: Client = {
      ...selectedClient,
      appointments: [...selectedClient.appointments, newAppointment]
    };
    
    updateClient(updatedClient);
  };

  const handleUpdateAppointment = (updatedAppointment: Appointment) => {
    if (!selectedClient) return;
    const updatedClient = {
      ...selectedClient,
      appointments: selectedClient.appointments.map(a => a.id === updatedAppointment.id ? updatedAppointment : a)
    };
    updateClient(updatedClient);
  };
  
  const handleUpdateClientDetails = (name: string, dob?: Date) => {
     if (!selectedClient) return;
     const updatedClient = { ...selectedClient, name, dob };
     updateClient(updatedClient);
  }

  const handleNewClient = (name: string) => {
    const newClientId = `client-${Date.now()}`;
    const newAppointmentId = `appt-${newClientId}-${Date.now()}`;
    const newClient: Client = {
        id: newClientId,
        name: name,
        appointments: [
            {
                id: newAppointmentId,
                date: new Date(),
                financialData: {
                    income: [],
                    assets: [],
                    pensions: [],
                }
            }
        ],
        planData: {
            annualReturn: 5,
            minLiquidity: 20000,
            semesters: [],
        }
    };
    const newClients = [...clients, newClient];
    setClients(newClients);
    setSelectedClientId(newClientId);
  };

  const handleNewClientClick = () => {
    const name = prompt("Inserisci il nome del nuovo cliente:");
    if (name && name.trim() !== '') {
      handleNewClient(name.trim());
    }
  };

  const handleDeleteClient = () => {
      if (!selectedClient) return;
      const newClients = clients.filter(c => c.id !== selectedClientId);
      setClients(newClients);
  };

  const handleLogin = () => {
      // In a real app, this would involve an API call.
      // For now, we just simulate a successful login.
      setIsAuthenticated(true);
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setSelectedClientId(''); // Reset client selection on logout
  };

  if (!isAuthenticated) {
      return <LoginScreen onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-colibri-gray-100 text-colibri-gray-800">
       <header className="bg-white shadow-md flex-shrink-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-colibri-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.5 7.5L15.5 10.5M17 6L14 9"/>
                <path d="M19 4.5A2.5 2.5 0 0 0 16.5 2C15.5 2 14 3 14 4.5C14 6.5 16 7 16 8.5C16 9.5 15 10 15 10"/>
                <path d="M14 4.5C12.5 3.5 10.5 2 8.5 2C5.5 2 4 4.5 4 7.5C4 12.5 9 15.5 10.5 16.5L12.5 17.5L14.5 16.5C16 15.5 21 12.5 21 7.5C21 6.5 20.5 5.5 19.5 5"/>
              </svg>
              <h1 className="text-2xl sm:text-3xl font-bold text-colibri-gray-800 ml-3">
                Colibrinvest <span className="font-light hidden sm:inline">| Pianificazione Finanziaria</span>
              </h1>
            </div>
             <div className="flex items-center space-x-4">
              <ClientSearchSelector
                clients={clients}
                selectedClientId={selectedClientId}
                onClientChange={setSelectedClientId}
              />
              <button 
                onClick={handleNewClientClick}
                className="flex items-center text-sm font-medium text-colibri-blue hover:text-blue-700 transition-colors"
                aria-label="Aggiungi nuovo cliente"
              >
                <PlusCircleIcon />
                <span className="ml-2 hidden md:inline">Nuovo</span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center text-sm font-medium text-colibri-gray-500 hover:text-colibri-red transition-colors"
                aria-label="Logout"
              >
                <LogOutIcon />
                <span className="ml-2 hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {selectedClient && selectedAppointment ? (
          <div className="space-y-8 max-w-7xl mx-auto">
              <ClientDetails client={selectedClient} onUpdate={handleUpdateClientDetails} onDelete={handleDeleteClient} />
              <AppointmentNavigator 
              client={selectedClient}
              selectedAppointmentId={selectedAppointmentId}
              onSelectAppointment={() => { /* Navigation is now implicit via latest */ }}
              onNewAppointment={handleNewAppointment}
              />
              {latestAppointment && (
              <FinancialSnapshot 
                  appointment={selectedAppointment} 
                  onUpdate={handleUpdateAppointment} 
                  isHistorical={selectedAppointment.id !== latestAppointment.id}
              />
              )}
              <TenYearPlan client={selectedClient} onUpdate={updateClient} />
              <footer className="text-center p-4 text-sm text-colibri-gray-500 mt-8">
                  © {new Date().getFullYear()} Colibrinvest. Tutti i diritti riservati.
              </footer>
          </div>
          ) : (
          <div className="flex items-center justify-center h-full">
              <div className="text-center py-20 px-6 bg-white rounded-lg shadow-lg">
                  <h2 className="text-2xl font-semibold">Benvenuto in Colibrinvest!</h2>
                  <p className="text-colibri-gray-500 mt-2 mb-6">Cerca un cliente esistente o creane uno nuovo per iniziare.</p>
                  <p className="text-sm text-colibri-blue font-medium">
                      ↑ Usa la barra di ricerca in alto per trovare un cliente.
                  </p>
              </div>
          </div>
          )}
      </main>
    </div>
  );
};

export default App;