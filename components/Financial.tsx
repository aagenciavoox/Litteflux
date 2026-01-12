
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Campaign, CampaignStatus } from '../types';

interface FinancialProps {
  campaigns: Campaign[];
  onEditValues: () => void;
  onPartnerSplit: () => void;
  splitRules: { gestor: number, operacional: number, reserva: number };
}

const Financial: React.FC<FinancialProps> = ({ campaigns, onEditValues, onPartnerSplit, splitRules }) => {
  // Rotina Automática: Cálculo de métricas financeiras reais baseadas em campanhas
  const metrics = useMemo(() => {
    let saldoTotal = 0; // Pago pelo cliente
    let aReceber = 0; // Pendente de cliente
    let repassesPendentes = 0; // Pendente de pagamento ao influencer

    campaigns.forEach(c => {
      const isPaid = c.financial?.statusPagCliente === 'Pago';
      const val = c.financial?.grossValue || 0;
      const tax = c.financial?.litteTax || (val * 0.2);
      const cut = c.financial?.influencerCut || (val * 0.8);

      if (isPaid) {
        saldoTotal += tax; // No caixa da Littê fica apenas a taxa após repasse
        if (c.financial?.statusRepasse !== 'Pago') {
          repassesPendentes += cut;
        }
      } else {
        aReceber += val;
      }
    });

    return { saldoTotal, aReceber, repassesPendentes };
  }, [campaigns]);

  const dataFin = useMemo(() => {
    // Gerar gráfico simplificado baseado nos últimos meses ou campanhas
    const recent = campaigns.slice(0, 6).reverse();
    return recent.map(c => ({
      name: c.brand.substring(0, 8),
      entrada: c.financial?.grossValue || 0,
      saida: (c.financial?.influencerCut || 0) + (c.financial?.partnerSplit || 0)
    }));
  }, [campaigns]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Finanças</h3>
          <p className="text-slate-500 text-sm mt-0.5">Fluxo de Caixa Consolidado Littê</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-medium hover:bg-slate-50 transition-all"
          >
            Exportar Dados
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-6 rounded-2xl text-white flex flex-col justify-between relative overflow-hidden">
          <svg className="absolute -right-6 -top-6 w-32 h-32 text-white/5" fill="currentColor" viewBox="0 0 20 20"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div className="z-10">
            <p className="text-xs text-slate-400 mb-1">Comissão Acumulada</p>
            <h4 className="text-3xl font-bold">R$ {metrics.saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
          </div>
          <div className="mt-6 flex justify-between items-end border-t border-white/10 pt-4 z-10">
            <div className="text-xs text-slate-400 space-y-1">
              <p>A Receber: <span className="text-white">R$ {metrics.aReceber.toLocaleString()}</span></p>
              <p>Repasses Pendentes: <span className="text-rose-400">R$ {metrics.repassesPendentes.toLocaleString()}</span></p>
            </div>
            <div className="bg-emerald-600 px-3 py-1 rounded-lg text-xs font-medium">
              LIVE
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 relative">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-sm font-medium text-slate-600">Divisão de Lucros (Split Estimado)</h5>
            <button
              onClick={onPartnerSplit}
              className="text-xs font-medium text-emerald-600 hover:underline"
            >
              Regras de Divisão
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: 'Sócio Gestor', value: `R$ ${(metrics.saldoTotal * (splitRules.gestor / 100)).toLocaleString()}`, color: 'bg-emerald-600', percent: splitRules.gestor },
              { name: 'Sócio Operacional', value: `R$ ${(metrics.saldoTotal * (splitRules.operacional / 100)).toLocaleString()}`, color: 'bg-emerald-500', percent: splitRules.operacional },
              { name: 'Reserva Littê', value: `R$ ${(metrics.saldoTotal * (splitRules.reserva / 100)).toLocaleString()}`, color: 'bg-slate-300', percent: splitRules.reserva },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between h-28">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                  <span className="text-xs text-slate-500">{item.name} ({item.percent}%)</span>
                </div>
                <span className="text-xl font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={onEditValues}
            className="absolute bottom-4 right-6 text-xs text-slate-400 hover:text-emerald-600 transition-colors"
          >
            Ajuste Manual
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h5 className="text-sm font-medium text-slate-600">Sazonalidade Financeira (Campanhas Recentes)</h5>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataFin.length > 0 ? dataFin : [{ name: 'Sem dados', entrada: 0, saida: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                labelStyle={{ fontWeight: 600, marginBottom: '4px', color: '#1e293b' }}
              />
              <Area type="monotone" dataKey="entrada" name="Faturamento Bruto" stroke="#10b981" strokeWidth={2} fill="#10b98120" />
              <Area type="monotone" dataKey="saida" name="Custo Operacional" stroke="#f43f5e" strokeWidth={2} fill="#f43f5e10" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Financial;
