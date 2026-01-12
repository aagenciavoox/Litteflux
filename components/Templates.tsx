
import React, { useState, useEffect, useCallback } from 'react';
import { Template, UserRole } from '../types';
import { db } from '../services/supabase';
import { Button } from './Modals';

interface TemplatesProps {
  role: UserRole;
  onEdit: (template: Template) => void;
  onAdd: () => void;
  addToast: (msg: string, type?: any) => void;
  // Add missing onDelete prop
  onDelete?: (id: string) => Promise<void>;
}

const Templates: React.FC<TemplatesProps> = ({ role, onEdit, onAdd, addToast, onDelete }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = role === UserRole.ADMIN;

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await db.getTemplates();
      setTemplates(data);
    } catch (err) {
      addToast('Erro ao carregar templates do servidor.', 'ERROR');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCopy = (template: Template) => {
    const taskList = template.tasks.map(t => `[ ] ${t}`).join('\n');
    const text = `📋 TEMPLATE: ${template.title.toUpperCase()}\n---\n${template.description}\n\nCHECKLIST:\n${taskList}`;

    navigator.clipboard.writeText(text).then(() => {
      addToast('Conteúdo copiado para a área de transferência!', 'SUCCESS');
    }).catch(() => {
      addToast('Erro ao copiar conteúdo.', 'ERROR');
    });
  };

  // Local delete handler to ensure the list refreshes after deletion
  const handleDeleteLocal = async (id: string) => {
    if (onDelete) {
      await onDelete(id);
      fetchTemplates();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Biblioteca de Templates</h3>
          <p className="text-slate-400 text-[10px] font-bold mt-0.5 uppercase tracking-widest">Padronização Littê Flux para fluxos operacionais</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={fetchTemplates}
            className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-400 p-3 rounded-2xl hover:text-slate-900 transition-all shadow-sm flex items-center justify-center gap-2 group"
            title="Atualizar Lista"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-active:rotate-180 transition-transform'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-[10px] font-black uppercase md:hidden tracking-widest">Atualizar</span>
          </button>
          {isAdmin && (
            <button
              onClick={onAdd}
              className="flex-1 md:flex-none bg-[#1F7A5F] text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#156E56] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Novo Template
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-100 animate-pulse h-[280px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl"></div>
                <div className="h-4 w-3/4 bg-slate-50 rounded-full"></div>
                <div className="h-3 w-1/2 bg-slate-50 rounded-full"></div>
              </div>
              <div className="h-8 w-full bg-slate-50 rounded-xl"></div>
            </div>
          ))
        ) : templates.length > 0 ? (
          templates.map(template => (
            <div key={template.id} className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#1F7A5F]/30 transition-all group flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="w-14 h-14 bg-emerald-50 text-[#1F7A5F] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#1F7A5F] group-hover:text-white transition-colors text-2xl">
                  📄
                </div>
                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight line-clamp-1">{template.title}</h4>
                <p className="text-xs text-slate-400 mt-3 font-medium leading-relaxed line-clamp-2">{template.description || 'Sem descrição detalhada'}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{template.tasks.length} Itens</span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleCopy(template)}
                    className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors"
                  >
                    Copiar
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => onEdit(template)}
                      className="text-[10px] font-black text-[#1F7A5F] uppercase tracking-widest hover:text-[#156E56] transition-colors"
                    >
                      Editar
                    </button>
                  )}
                  {/* Add delete button for admins */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteLocal(template.id)}
                      className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-700 transition-colors"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 bg-white rounded-[48px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center space-y-6 opacity-60">
            <div className="text-5xl">📭</div>
            <div className="text-center space-y-1">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Nenhum template disponível</p>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Crie padrões para acelerar sua operação</p>
            </div>
            {isAdmin && <Button onClick={onAdd} variant="secondary" className="scale-90">Começar Agora</Button>}
          </div>
        )}

        {isAdmin && !loading && templates.length > 0 && (
          <div
            onClick={onAdd}
            className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-10 min-h-[280px] hover:bg-white hover:border-[#1F7A5F]/40 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-4">
              <span className="text-2xl text-slate-300 group-hover:text-[#1F7A5F]">＋</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-600 text-center px-4">Adicionar novo padrão de checklist</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;
