import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Defs, linearGradient, stop } from 'recharts';
import type { ChartDataPoint } from '../types';

interface PlanChartProps {
  data: ChartDataPoint[];
  projectionStartIndex: number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);
};

const PlanChart: React.FC<PlanChartProps> = ({ data, projectionStartIndex }) => {
  if (data.length < 1) {
    return (
      <div className="flex items-center justify-center h-full text-colibri-gray-500">
        Dati insufficienti per visualizzare il grafico.
      </div>
    );
  }

  const projectionStartTimestamp = data[projectionStartIndex - 1]?.timestamp;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 50,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
        <XAxis 
            dataKey="timestamp" 
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' })}
            angle={-30} 
            textAnchor="end" 
            height={70} 
            tick={{ fontSize: 12 }} 
        />
        <YAxis 
            tickFormatter={(value) => new Intl.NumberFormat('it-IT', { notation: 'compact', compactDisplay: 'short' }).format(Number(value))}
            width={100}
            tick={{ fontSize: 12 }}
            domain={[0, 'dataMax']}
        />
        <Tooltip 
            formatter={(value: number, name: string) => [formatCurrency(value), name]} 
            labelFormatter={(timestamp) => new Date(timestamp).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)', border: '1px solid #ddd', borderRadius: '8px' }}
        />
        <Legend wrapperStyle={{paddingTop: '20px'}} />
        
        <defs>
          <linearGradient id="colorLiquidity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7}/>
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
          </linearGradient>
           <linearGradient id="colorExternal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.7}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
           <linearGradient id="colorCapitale" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
           <linearGradient id="colorRendimenti" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#84cc16" stopOpacity={0.7}/>
            <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        <Area 
            type="monotone" 
            dataKey="totalLiquidity" 
            stackId="1" 
            stroke="#f59e0b"
            strokeDasharray={(value) => (value.payload.isProjection ? '5 5' : '0')} 
            fill="url(#colorLiquidity)" 
            name="Liquidità Totale" 
        />
        <Area 
            type="monotone" 
            dataKey="externalCapital" 
            stackId="1" 
            stroke="#6366f1"
            strokeDasharray={(value) => (value.payload.isProjection ? '5 5' : '0')}
            fill="url(#colorExternal)"
            name="Cap. Mobiliare Est."
        />
        <Area 
            type="monotone" 
            dataKey="capitaleVersato" 
            stackId="1" 
            stroke="#3b82f6"
            strokeDasharray={(value) => (value.payload.isProjection ? '5 5' : '0')}
            fill="url(#colorCapitale)"
            name="Capitale Versato"
        />
        <Area 
            type="monotone" 
            dataKey="rendimenti" 
            stackId="1" 
            stroke="#84cc16" 
            strokeDasharray={(value) => (value.payload.isProjection ? '5 5' : '0')}
            fill="url(#colorRendimenti)" 
            name="Rendimenti" 
        />

        {projectionStartTimestamp && (
          <ReferenceLine x={projectionStartTimestamp} stroke="#4b5563" strokeDasharray="3 3">
             <Legend content={() => <text x={projectionStartTimestamp} y={25} fill="#4b5563" textAnchor="middle">Oggi</text>} />
          </ReferenceLine>
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PlanChart;