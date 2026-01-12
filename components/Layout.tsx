
import React from 'react';
import { createPortal } from 'react-dom';
import { ICONS } from '../constants';
import { UserRole, Toast, UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  onOpenCreateModal: () => void;
  onOpenCampaignModal?: () => void;
  onSignOut: () => void;
  profile: UserProfile | null;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  role,
  setRole,
  onOpenCreateModal,
  onOpenCampaignModal,
  onSignOut,
  profile,
  toasts,
  removeToast
}) => {
  const isAdmin = role === UserRole.ADMIN;
  // Hierarquia Obrigatória de Telas
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: ICONS.Dashboard },
    { id: 'influencers', label: isAdmin ? 'Assessorados' : 'Meus Dados', icon: ICONS.Influencers },
    { id: 'crm', label: 'Prospecções', icon: ICONS.CRM },
    { id: 'campaigns', label: 'Campanhas Ativas', icon: ICONS.Campaigns },
    { id: 'finance', label: 'Financeiro', icon: ICONS.Finance, adminOnly: true },
    { id: 'calendar', label: 'Calendário', icon: ICONS.Calendar, adminOnly: true },
    { id: 'history', label: 'Histórico', icon: ICONS.History, adminOnly: true },
    { id: 'templates', label: 'Templates', icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>, adminOnly: true },
    { id: 'notes', label: 'Notas', icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>, adminOnly: true },
    { id: 'notifications', label: 'Notificações', icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>, adminOnly: true },
    { id: 'settings', label: 'Configurações', icon: ICONS.Settings },
    { id: 'access', label: 'Acessos', icon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v3m0-3h3m-3 0H9m12-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, adminOnly: true },
  ];

  const toastContent = createPortal(
    <div className="fixed top-4 right-4 z-[120] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto min-w-[280px] max-w-sm p-4 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-right-full duration-200 border ${toast.type === 'SUCCESS' ? 'bg-emerald-600 border-emerald-600 text-white' : toast.type === 'ERROR' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-slate-200 text-slate-700'
            }`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${toast.type === 'SUCCESS' ? 'bg-white/20' : toast.type === 'ERROR' ? 'bg-white/20' : 'bg-slate-100'}`}>
            {toast.type === 'SUCCESS' ? '✓' : toast.type === 'ERROR' ? '✕' : 'ℹ'}
          </div>
          <p className="text-sm font-medium flex-1">{toast.message}</p>
        </div>
      ))}
    </div>,
    document.getElementById('toast-portal') || document.body
  );

  return (
    <div id="app-shell">
      {toastContent}
      <aside id="sidebar-container" className="bg-slate-900 text-white flex flex-col border-r border-slate-800 overflow-y-auto scrollbar-hide">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold">L</div>
            <h1 className="text-base font-semibold text-white">Littê Flux</h1>
          </div>
          <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-wide font-medium">{isAdmin ? 'Gestão de Agência' : 'Portal Criador'}</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {tabs.map((tab) => {
            if (tab.adminOnly && !isAdmin) return null;
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${activeTab === tab.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
                <div className={`${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-400'}`}><Icon /></div>
                <span className="font-medium text-[13px]">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={onSignOut} className="w-full py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white transition-all">Sair</button>
        </div>
      </aside>

      <div id="main-layout">
        <header id="header-container" className="bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-5 w-0.5 bg-emerald-600 rounded-full"></div>
            <h2 className="text-sm font-semibold text-slate-800">{tabs.find(t => t.id === activeTab)?.label || activeTab}</h2>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button onClick={onOpenCampaignModal} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-medium text-xs hover:bg-slate-50 transition-all flex items-center gap-2">
                <span>🚀</span> Nova Campanha
              </button>
              <button onClick={onOpenCreateModal} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-xs hover:bg-emerald-700 transition-all flex items-center gap-2">
                <span>+</span> Novo Andamento
              </button>
            </div>
          )}
        </header>
        <section id="view-content" className="p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto">{children}</div>
        </section>
      </div>
    </div>
  );
};

export default Layout;
