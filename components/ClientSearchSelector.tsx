import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Client } from '../types';

interface ClientSearchSelectorProps {
  clients: Client[];
  selectedClientId: string;
  onClientChange: (clientId: string) => void;
}

const ClientSearchSelector: React.FC<ClientSearchSelectorProps> = ({ clients, selectedClientId, onClientChange }) => {
  const selectedClientName = useMemo(() => clients.find(c => c.id === selectedClientId)?.name || '', [clients, selectedClientId]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(selectedClientName);
  }, [selectedClientName]);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    if (searchTerm === selectedClientName) return clients;
    return clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, clients, selectedClientName]);

  const handleSelectClient = (clientId: string) => {
    onClientChange(clientId);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm(selectedClientName);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, selectedClientName]);

  return (
    <div className="relative w-64 md:w-72" ref={wrapperRef}>
      <input
        type="text"
        placeholder="Cerca o seleziona cliente..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsDropdownOpen(true);
        }}
        onFocus={() => setIsDropdownOpen(true)}
        className="w-full bg-white border border-colibri-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-colibri-green focus:border-colibri-green"
      />
      {isDropdownOpen && (
        <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg z-30 border border-colibri-gray-200">
          <ul className="max-h-60 overflow-auto">
            {filteredClients.length > 0 ? filteredClients.map(client => (
              <li key={client.id}>
                <button
                  onClick={() => handleSelectClient(client.id)}
                  className="w-full text-left px-4 py-2 text-sm text-colibri-gray-700 hover:bg-colibri-gray-100"
                >
                  {client.name}
                </button>
              </li>
            )) : (
                <li className="px-4 py-2 text-sm text-colibri-gray-500">Nessun cliente trovato.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClientSearchSelector;
