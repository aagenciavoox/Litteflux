
import React, { useMemo } from 'react';
import { UserRole, Lead, Campaign, LeadStatus, CampaignStatus } from '../types';

interface DashboardProps {
  role: UserRole;
  userName?: string;
  leads: Lead[];
  campaigns: Campaign[];
  loadingLeads?: boolean;
  loadingCampaigns?: boolean;
  onQuickAction?: (action: string, param?: any) => void;
  influencers?: any[]; // Making optional to avoid immediate break, but ideally strictly typed
}

const StatCard = ({ title, value, change, isPositive, loading }: { title: string, value: string | number, change?: string, isPositive?: boolean, loading?: boolean }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition-all duration-200 group">
    {loading ? (
      <div className="space-y-3 animate-pulse">
        <div className="h-3 w-20 bg-slate-100 rounded"></div>
        <div className="h-7 w-24 bg-slate-50 rounded"></div>
      </div>
    ) : (
      <>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-slate-500">{title}</p>
          {change && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {change}
            </span>
          )}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{value}</h3>
      </>
    )}
  </div>
);

const SkeletonList = () => (
  <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-xl items-center animate-pulse">
        <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-2 w-16 bg-slate-100 rounded"></div>
          <div className="h-3 w-28 bg-slate-100 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({
  role,
  userName,
  leads,
  campaigns,
  loadingLeads,
  loadingCampaigns,
  onQuickAction,
  influencers = []
}) => {
  const isAdmin = role === UserRole.ADMIN;

  // Cálculos baseados em Campanhas
  const activeCampaignsCount = useMemo(() => campaigns.filter(c => c.status !== CampaignStatus.COMPLETED).length, [campaigns]);
  const financialForecast = useMemo(() => campaigns
    .filter(c => c.status !== CampaignStatus.COMPLETED)
    .reduce((acc, c) => acc + (c.financial?.grossValue || 0), 0), [campaigns]);

  // Cálculos baseados em Leads
  const activeLeadsCount = useMemo(() => leads.filter(l => l.status === LeadStatus.WAITING).length, [leads]);

  const deadlines = useMemo(() => {
    const list: any[] = [];
    const delays: any[] = [];
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const check = (dateStr: string, task: string, brand: string, status: string, concludedVal: string, campaignId: string) => {
      if (!dateStr || dateStr === 'A definir' || dateStr === '') return;
      // Normalização de data para comparação
      const parts = dateStr.includes('/') ? dateStr.split('/') : null;
      const d = parts ? new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])) : new Date(dateStr);

      if (isNaN(d.getTime())) return;
      if (status === concludedVal) return;

      if (d < today) {
        delays.push({ date: d, task, brand, type: 'DELAY', campaignId });
      } else if (d <= next7Days) {
        list.push({ date: d, task, brand, type: 'UPCOMING', diff: Math.ceil((d.getTime() - today.getTime()) / (1000 * 3600 * 24)), campaignId });
      }
    };

    campaigns.forEach(c => {
      const inf = influencers.find(i => i.id === c.influencerIds?.[0]);
      const brandDisplay = inf ? `${c.brand} (@${inf.usuario})` : c.brand;

      check(c.contrato?.contratoDataPrevista, "Assinatura Contrato", brandDisplay, c.contrato?.statusContrato, "Assinado", c.id);
      check(c.roteiro?.roteiroDataPrevista, "Aprovação Roteiro", brandDisplay, c.roteiro?.roteiroStatus, "Aprovado", c.id);

      // Conteúdos Específicos
      c.conteudo?.items?.forEach((item: any) => {
        check(item.postDate, `Post: ${item.type} (${item.platform})`, brandDisplay, item.status, "Postado", c.id);
      });

      // Legado (Postagem Única)
      check(c.postagem?.postagemData, "Publicação Oficial", brandDisplay, c.postagem?.postagemStatus, "Publicado", c.id);

      check(c.metricas?.metricasDataPrevista, "Coleta Métricas", brandDisplay, c.metricas?.metricasStatus, "Enviado ao Cliente", c.id);

      // Financeiro e Logística
      check(c.nf?.nfDataEmissao, "Emissão de NF", brandDisplay, c.nf?.nfStatus, "Emitida", c.id);
      check(c.nf?.nfDataPrevistaPagamento, "Recebimento Cliente", brandDisplay, c.nf?.nfStatus, "Pendente", c.id);
      check(c.repasse?.repasseData, "Repasse Littê", brandDisplay, c.repasse?.repasseStatus, "Pago", c.id);
      check(c.produto?.produtoDataEnvio, "Chegada Produto", brandDisplay, c.produto?.produtoStatus, "Entregue", c.id);
    });

    return {
      upcoming: list.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5),
      delays: delays.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5)
    };
  }, [campaigns]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header with Dynamic Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">
            {userName ? `Olá, ${userName.split(' ')[0]}!` : 'Monitor Littê'}
          </h3>
          <p className="text-slate-500 text-sm mt-0.5">{isAdmin ? 'Gestão de Agência' : 'Portal do Assessorado'} • Littê Flux v2.5</p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => window.print()} className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors" title="Imprimir Relatório">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          </button>
          {isAdmin && (
            <button onClick={() => onQuickAction?.('NEW_LEAD')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-emerald-700 transition-all">
              Novo Business
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jobs Ativos"
          value={activeCampaignsCount}
          loading={loadingCampaigns}
        />
        {isAdmin && (
          <StatCard
            title="Prospecções"
            value={activeLeadsCount}
            loading={loadingLeads}
            change={activeLeadsCount > 0 ? 'Em curso' : 'Vazio'}
            isPositive={activeLeadsCount > 0}
          />
        )}
        <StatCard
          title="Alertas Críticos"
          value={deadlines.delays.length}
          change={deadlines.delays.length > 0 ? 'Ação Necessária' : 'Saudável'}
          isPositive={deadlines.delays.length === 0}
          loading={loadingCampaigns}
        />
        {isAdmin && (
          <StatCard
            title="Receita Prevista"
            value={`R$ ${financialForecast.toLocaleString()}`}
            isPositive={true}
            loading={loadingCampaigns}
          />
        )}
      </div>

      {/* Tracking Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delays Panel */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-sm font-semibold text-rose-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Atrasos Críticos
            </h4>
            <span className="text-xs text-slate-400">Painel de Riscos</span>
          </div>

          <div className="space-y-3">
            {loadingCampaigns ? <SkeletonList /> : deadlines.delays.length > 0 ? deadlines.delays.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 bg-rose-50 rounded-xl items-center group hover:bg-rose-100 transition-colors cursor-pointer"
                onClick={() => onQuickAction?.('OPEN_CAMPAIGN', item.campaignId)}
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-sm font-bold text-rose-600 border border-rose-200">!</div>
                <div className="flex-1">
                  <p className="text-[11px] text-rose-500 font-medium mb-0.5">{item.brand}</p>
                  <p className="text-sm font-semibold text-slate-800">{item.task}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-rose-400">Expirado</p>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500 text-lg">✓</div>
                <p className="text-sm text-slate-400">Operação 100% em dia</p>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Panel */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-sm font-semibold text-emerald-600">Calendário Imediato</h4>
            <span className="text-xs text-slate-400">Próximos 7 dias</span>
          </div>

          <div className="space-y-3">
            {loadingCampaigns ? <SkeletonList /> : deadlines.upcoming.length > 0 ? deadlines.upcoming.map((item, i) => (
              <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-xl items-center group hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-sm font-bold text-emerald-600 border border-slate-200">{item.diff}d</div>
                <div className="flex-1">
                  <p className="text-[11px] text-slate-400 font-medium mb-0.5">{item.brand}</p>
                  <p className="text-sm font-semibold text-slate-800">{item.task}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => onQuickAction?.('OPEN_CAMPAIGN', item.campaignId)} className="text-xs font-medium text-emerald-600">Ver →</button>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-400">Sem compromissos agendados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
