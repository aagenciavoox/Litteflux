
import React, { useState, useEffect } from 'react';
import { db } from '../services/supabase';
import { UserProfile, UserRole, UserStatus } from '../types';
import { Button } from './Modals';

const AccessManager: React.FC = () => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [preApproved, setPreApproved] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState<UserRole>(UserRole.GUEST);

    const loadData = async () => {
        setLoading(true);
        try {
            const [profilesData, preApprovedData] = await Promise.all([
                db.getProfiles(),
                db.getPreApprovedEmails()
            ]);
            setProfiles(profilesData);
            setPreApproved(preApprovedData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleUpdateStatus = async (id: string, status: UserStatus) => {
        try {
            await db.updateProfile(id, { status });
            loadData();
        } catch (err) {
            alert('Erro ao atualizar status');
        }
    };

    const handleUpdateRole = async (id: string, role: UserRole) => {
        try {
            await db.updateProfile(id, { role });
            loadData();
        } catch (err) {
            alert('Erro ao atualizar role');
        }
    };

    const handleAddPreApproval = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail) return;
        try {
            await db.addPreApprovedEmail(newEmail, newRole);
            setNewEmail('');
            loadData();
            alert('Email pré-aprovado com sucesso!');
        } catch (err) {
            alert('Erro ao pré-aprovar email. Verifique se ele já não está na lista.');
        }
    };

    const handleDeletePreApproval = async (email: string) => {
        if (!confirm('Remover esta pré-aprovação?')) return;
        try {
            await db.deletePreApprovedEmail(email);
            loadData();
        } catch (err) {
            alert('Erro ao remover');
        }
    };

    if (loading) return <div className="p-10 text-center uppercase font-black text-slate-400">Carregando acessos...</div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Gestão de Acessos</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Controle de usuários e permissões do sistema</p>
                </div>
            </div>

            {/* Seção de Pré-Aprovação */}
            <div className="bg-slate-900 p-8 md:p-12 rounded-[40px] shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32 rounded-full"></div>

                <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Pré-aprovação de Convites</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Usuários com estes emails serão aprovados automaticamente ao se cadastrarem</p>
                </div>

                <form onSubmit={handleAddPreApproval} className="flex flex-col md:flex-row gap-4 items-end bg-white/5 p-6 rounded-3xl border border-white/10 relative z-10">
                    <div className="flex-1 space-y-2 w-full">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email do Usuário</label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="exemplo@litte.com"
                            className="w-full bg-white/10 border-none rounded-2xl text-white py-4 px-6 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                            required
                        />
                    </div>
                    <div className="w-full md:w-64 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Papel (Role)</label>
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as UserRole)}
                            className="w-full bg-white/10 border-none rounded-2xl text-white py-4 px-6 focus:ring-2 focus:ring-emerald-500 transition-all outline-none uppercase font-black text-xs tracking-widest cursor-pointer"
                        >
                            <option value={UserRole.INFLUENCER} className="bg-slate-800">Influenciador</option>
                            <option value={UserRole.ADMIN} className="bg-slate-800">Administrador</option>
                            <option value={UserRole.GUEST} className="bg-slate-800">Convidado</option>
                        </select>
                    </div>
                    <Button type="submit" className="py-4 px-8 h-[56px] w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900 border-none shadow-[0_10px_30px_-10px_rgba(16,185,129,0.3)]">
                        Pré-Aprovar
                    </Button>
                </form>

                {preApproved.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                        {preApproved.map(item => (
                            <div key={item.email} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                                <div>
                                    <p className="text-white font-black text-sm tracking-tight">{item.email}</p>
                                    <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest mt-1">{item.role}</p>
                                </div>
                                <button
                                    onClick={() => handleDeletePreApproval(item.email)}
                                    className="w-8 h-8 rounded-xl bg-white/5 text-slate-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Usuários Cadastrados</h3>
                    <div className="h-px flex-1 bg-slate-100"></div>
                </div>

                <div className="grid gap-6">
                    {profiles.map((p) => (
                        <div key={p.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl font-black text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all duration-500 transform group-hover:rotate-6">
                                        {p.full_name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3 mb-1">
                                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{p.full_name}</h3>
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${p.status === UserStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                p.status === UserStatus.BLOCKED ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                    'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 font-bold text-base tracking-tight">{p.email}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 bg-slate-50/50 p-4 rounded-3xl lg:bg-transparent lg:p-0">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Atribuição de Papel</span>
                                        <select
                                            value={p.role}
                                            onChange={(e) => handleUpdateRole(p.id, e.target.value as UserRole)}
                                            className="bg-white border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest p-4 pr-12 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                                        >
                                            <option value={UserRole.ADMIN}>Administrador</option>
                                            <option value={UserRole.INFLUENCER}>Influenciador</option>
                                            <option value={UserRole.GUEST}>Convidado</option>
                                        </select>
                                    </div>

                                    <div className="flex items-end gap-3">
                                        {p.status !== UserStatus.APPROVED && (
                                            <Button onClick={() => handleUpdateStatus(p.id, UserStatus.APPROVED)} className="py-4 px-10 h-[56px] text-xs font-black uppercase tracking-widest">
                                                Aprovar Acesso
                                            </Button>
                                        )}
                                        {p.status !== UserStatus.BLOCKED && (
                                            <Button onClick={() => handleUpdateStatus(p.id, UserStatus.BLOCKED)} variant="secondary" className="py-4 px-10 h-[56px] text-xs font-black uppercase tracking-widest text-rose-600 border-rose-100 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300">
                                                Bloquear
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AccessManager;
