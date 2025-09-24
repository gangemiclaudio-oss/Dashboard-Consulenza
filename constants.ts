import type { Client } from './types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Mario Rossi',
    dob: new Date('1980-05-15'),
    appointments: [
      {
        id: 'appt-1-1',
        date: new Date('2023-10-26'), // Historical date
        financialData: {
          income: [
            { id: 'inc-1', type: 'Reddito Netto', description: 'Reddito Familiare Annuo', amount: 85000 },
            { id: 'inc-2', type: 'Spesa Media', description: 'Tenore di Vita Annuo', amount: 55000 },
          ],
          assets: [
            { id: 'as-1', type: 'Immobile', description: 'Abitazione Principale', details: 'Via Roma 1, Milano', amount: 450000, mortgage: 150000 },
            { id: 'as-2', type: 'Capitale Mobiliare', description: 'Conto Intesa Sanpaolo', details: 'Intesa Sanpaolo', amount: 75000 },
            { id: 'as-3', type: 'Capitale in Consulenza', description: 'Portafoglio Colibrinvest', details: 'Colibrinvest', amount: 120000 },
            { id: 'as-6', type: 'Liquidità in Consulenza', description: 'Liquidità su Family Banker', details: 'Colibrinvest', amount: 80000 },
            { id: 'as-4', type: 'Liquidità', description: 'Conto Corrente', details: 'Fineco', amount: 30000 },
            { id: 'as-5', type: 'Liquidità', description: 'ETF Monetario', details: 'Scalable Capital', amount: 20000 },
          ],
          pensions: [
            { id: 'pen-1', type: 'Fondo Pensione', description: 'Fondo Pensione di Categoria', amount: 60000 },
            { id: 'pen-2', type: 'TFR', description: 'TFR accantonato', amount: 45000 },
          ]
        }
      },
      {
        id: 'appt-1-2',
        date: new Date(), // Latest appointment
        financialData: {
          income: [
            { id: 'inc-1', type: 'Reddito Netto', description: 'Reddito Familiare Annuo', amount: 87000 },
            { id: 'inc-2', type: 'Spesa Media', description: 'Tenore di Vita Annuo', amount: 56000 },
          ],
          assets: [
            { id: 'as-1', type: 'Immobile', description: 'Abitazione Principale', details: 'Via Roma 1, Milano', amount: 460000, mortgage: 145000 },
            { id: 'as-2', type: 'Capitale Mobiliare', description: 'Conto Intesa Sanpaolo', details: 'Intesa Sanpaolo', amount: 78000 },
            { id: 'as-3', type: 'Capitale in Consulenza', description: 'Portafoglio Colibrinvest', details: 'Colibrinvest', amount: 135000 },
            { id: 'as-7', type: 'Capitale Mobiliare', description: 'Google', details: 'stock options', amount: 192000 },
            { id: 'as-6', type: 'Liquidità in Consulenza', description: 'Liquidità su Family Banker', details: 'Colibrinvest', amount: 70000 },
            { id: 'as-4', type: 'Liquidità', description: 'Conto Corrente', details: 'Fineco', amount: 32000 },
            { id: 'as-5', type: 'Liquidità', description: 'ETF Monetario', details: 'Scalable Capital', amount: 25000 },
          ],
          pensions: [
            { id: 'pen-1', type: 'Fondo Pensione', description: 'Fondo Pensione di Categoria', amount: 65000 },
            { id: 'pen-2', type: 'TFR', description: 'TFR accantonato', amount: 48000 },
          ]
        }
      }
    ],
    planData: {
      annualReturn: 5,
      minLiquidity: 50000,
      semesters: [
        { id: 'appt-1-2', change: 10000 } // Example historical change
      ],
      externalAssetReturns: {
        'as-2': 2.5, // Intesa Sanpaolo
        'as-7': 12   // Google stock
      }
    }
  },
  {
    id: 'client-2',
    name: 'Giulia Bianchi',
    dob: new Date('1992-11-01'),
    appointments: [
        {
            id: 'appt-2-1',
            date: new Date(),
            financialData: {
                income: [
                    { id: 'inc-1', type: 'Reddito Netto', description: 'Reddito Annuo', amount: 60000 },
                    { id: 'inc-2', type: 'Spesa Media', description: 'Tenore di Vita Annuo', amount: 40000 },
                ],
                assets: [
                    { id: 'as-1', type: 'Capitale in Consulenza', description: 'Portafoglio Colibrinvest', details: 'Colibrinvest', amount: 250000 },
                    { id: 'as-2', type: 'Liquidità', description: 'Conto Deposito', details: 'Banca Sella', amount: 95600 },
                ],
                pensions: [
                    { id: 'pen-1', type: 'Fondo Pensione', description: 'PIP Personale', amount: 35000 },
                ]
            }
        }
    ],
    planData: {
      annualReturn: 7,
      minLiquidity: 40000,
      semesters: [],
    }
  }
];