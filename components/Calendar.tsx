
import React, { useState, useMemo } from 'react';
import { Campaign, Lead, UserRole, Influencer } from '../types';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'CONTRATO' | 'PRODUTO' | 'ROTEIRO' | 'CONTEUDO' | 'POSTAGEM' | 'METRICAS' | 'FINANCEIRO';
  isReal?: boolean;
  status: string;
  brand: string;
  influencerName: string;
}

interface CalendarProps {
  role: UserRole;
  campaigns: Campaign[];
  leads: Lead[];
  influencers: Influencer[];
  // Fix: Made onOpenEntity optional as it is not currently used by the component and was missing in App.tsx
  onOpenEntity?: (entity: Campaign | Lead, type: 'CAMPAIGN' | 'LEAD') => void;
}

// Fix: Destructured all props from CalendarProps to ensure consistency and fix build errors
const Calendar: React.FC<CalendarProps> = ({ role, campaigns, leads, influencers, onOpenEntity }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'MONTH' | 'WEEK'>('MONTH');

  const events = useMemo(() => {
    const list: CalendarEvent[] = [];

    const formatDate = (d: string) => {
      if (!d || d === 'A definir' || d === '') return null;
      return d.includes('/') ? d.split('/').reverse().join('-') : d;
    };

    campaigns.forEach(c => {
      const inf = influencers.find(i => i.id === c.influencerIds[0]);
      const infName = inf?.nome || 'Assessorado';

      // Auxiliar para adicionar evento
      const add = (d: string, title: string, type: any, status: string, isReal = false) => {
        if (!d) return;
        list.push({
          id: `${c.id}-${title}-${isReal}`, date: d, brand: c.brand, influencerName: infName,
          title: `${title}${isReal ? ' (Real)' : ''}`, description: `${c.brand} - ${infName}`, type, status, isReal
        });
      };

      // 1. Contrato
      add(c.contrato.contratoDataPrevista, "Contrato", 'CONTRATO', c.contrato.statusContrato);
      add(c.contrato.contratoDataReal, "Assinatura Contrato", 'CONTRATO', c.contrato.statusContrato, true);

      // 2. Produto
      add(c.produto.produtoDataEnvio, "Envio Produto", 'PRODUTO', c.produto.produtoStatus);

      // 3. Roteiro
      add(c.roteiro.roteiroDataPrevista, "Roteiro", 'ROTEIRO', c.roteiro.roteiroStatus);
      add(c.roteiro.roteiroDataReal, "Envio Roteiro", 'ROTEIRO', c.roteiro.roteiroStatus, true);
      add(c.roteiro.roteiroDataAprovacao, "Aprovação Roteiro", 'ROTEIRO', c.roteiro.roteiroStatus, true);

      // 4. Conteúdo (Múltiplos)
      c.conteudo?.items?.forEach((item: any) => {
        // Data de Postagem (agendada)
        add(item.postDate, `${item.type} (${item.platform})`, 'CONTEUDO', item.status);

        // Se houver status de aprovado/postado, podemos considerar como "real" ou manter apenas a data alvo
        if (item.status === 'Postado') {
          add(item.postDate, `${item.type} (${item.platform})`, 'POSTAGEM', 'Postado', true);
        }
      });

      // 5. Postagem (Legado - mantendo para compatibilidade mas preferindo items acima)
      if (c.postagem?.postagemData) {
        add(c.postagem.postagemData, "Postagem (Geral)", 'POSTAGEM', c.postagem.postagemStatus);
      }

      // 6. Métricas
      add(c.metricas.metricasDataPrevista, "Coleta Métricas", 'METRICAS', c.metricas.metricasStatus);

      // 7. Financeiro
      add(c.nf.nfDataEmissao, "Emissão NF", 'FINANCEIRO', c.nf.nfStatus);
      add(c.nf.nfDataPrevistaPagamento, "Pagamento NF", 'FINANCEIRO', c.nf.nfStatus);
      add(c.repasse.repasseData, "Repasse Littê", 'FINANCEIRO', c.repasse.repasseStatus);
    });

    return list.map(ev => ({ ...ev, date: formatDate(ev.date) || '' })).filter(ev => ev.date !== '');
  }, [campaigns, influencers]);

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // Navigation helpers
  const handlePrev = () => {
    const newDate = new Date(viewDate);
    if (viewMode === 'MONTH') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setViewDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(viewDate);
    if (viewMode === 'MONTH') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setViewDate(newDate);
  };

  // Logic for Grid Generation
  const generateGrid = () => {
    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const currentDate = viewDate.getDate();
    const currentDay = viewDate.getDay(); // 0 (Sun) - 6 (Sat)

    if (viewMode === 'MONTH') {
      const numDays = new Date(currentYear, currentMonth + 1, 0).getDate();
      const startOffset = new Date(currentYear, currentMonth, 1).getDay();

      return Array.from({ length: 42 }).map((_, i) => {
        const d = i - startOffset + 1;
        const isCurrentMonth = d > 0 && d <= numDays;
        let dateObj = null;
        if (isCurrentMonth) {
          dateObj = new Date(currentYear, currentMonth, d);
        }
        return {
          day: d,
          isCurrentRange: isCurrentMonth,
          dateObj
        };
      });
    } else {
      // WEEK MODE
      // Find Sunday of the current week
      const startOfWeek = new Date(viewDate);
      startOfWeek.setDate(currentDate - currentDay);

      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return {
          day: d.getDate(),
          isCurrentRange: true,
          dateObj: d
        };
      });
    }
  };

  const gridCells = generateGrid();

  const getDayEvents = (dateObj: Date | null) => {
    if (!dateObj) return [];

    // Format YYYY-MM-DD manually to avoid timezone issues
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    const dStr = `${year}-${month}-${day}`;

    return events.filter(e => e.date === dStr);
  };

  const typeColors = {
    CONTRATO: 'bg-blue-50 text-blue-700 border-blue-400',
    PRODUTO: 'bg-purple-50 text-purple-700 border-purple-400',
    ROTEIRO: 'bg-amber-50 text-amber-700 border-amber-400',
    CONTEUDO: 'bg-emerald-50 text-emerald-700 border-emerald-400',
    POSTAGEM: 'bg-rose-50 text-rose-700 border-rose-400',
    METRICAS: 'bg-slate-50 text-slate-700 border-slate-400',
    FINANCEIRO: 'bg-[#1F7A5F]/10 text-[#1F7A5F] border-[#1F7A5F]'
  };

  const headerTitle = useMemo(() => {
    if (viewMode === 'MONTH') {
      return `${monthNames[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
    } else {
      const startOfWeek = new Date(viewDate);
      startOfWeek.setDate(viewDate.getDate() - viewDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      // Simple range display
      const startStr = `${startOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()].substr(0, 3)}`;
      const endStr = `${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()].substr(0, 3)}`;
      return `${startStr} - ${endStr}, ${viewDate.getFullYear()}`;
    }
  }, [viewDate, viewMode]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Agenda Littê Flux</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sincronização Total de Campanhas</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('MONTH')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'MONTH' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            Mês
          </button>
          <button
            onClick={() => setViewMode('WEEK')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'WEEK' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            Semana
          </button>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={handlePrev} className="p-2 hover:bg-slate-50 rounded-xl transition-all">←</button>
          <span className="text-sm font-black text-slate-800 uppercase tracking-widest min-w-[180px] text-center">{headerTitle}</span>
          <button onClick={handleNext} className="p-2 hover:bg-slate-50 rounded-xl transition-all">→</button>
        </div>
      </div>

      <div className={`grid ${viewMode === 'MONTH' ? 'grid-cols-7' : 'grid-cols-7'} gap-px bg-slate-100 border border-slate-200 rounded-[32px] overflow-hidden shadow-2xl`}>
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="bg-slate-50 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
        ))}
        {gridCells.map((cell, i) => {
          const dayEvents = getDayEvents(cell.dateObj);
          return (
            <div
              key={i}
              className={`
                bg-white p-3 border-slate-50 relative group 
                ${!cell.isCurrentRange ? 'opacity-20' : ''} 
                ${viewMode === 'WEEK' ? 'min-h-[400px]' : 'min-h-[140px]'}
              `}
            >
              {cell.isCurrentRange && (
                <span className={`text-xs font-black ${cell.dateObj?.toDateString() === new Date().toDateString() ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {cell.day}
                </span>
              )}
              <div className="mt-2 space-y-1">
                {dayEvents.map((ev, idx) => (
                  <div key={`${ev.id}-${idx}`} className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase truncate border-l-2 shadow-sm ${typeColors[ev.type]} ${ev.isReal ? 'opacity-60 italic' : ''}`}>
                    {ev.brand} • {ev.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
