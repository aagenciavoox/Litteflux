
import React, { useEffect, useState } from 'react';
import { db, supabase } from '../services/supabase';

const Notifications: React.FC = () => {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const data = await db.getNotifications(session.user.id);
        setNotifs(data);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Centro de Alertas</h3>
        <p className="text-slate-500 text-xs font-medium mt-0.5 uppercase tracking-widest">Sincronização Real-time de Datas e Auditoria.</p>
      </div>
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-20 text-center opacity-20 font-black uppercase tracking-widest">Buscando alertas...</div>
          ) : notifs.length > 0 ? notifs.map((notif, i) => (
            <div key={notif.id} className="p-8 flex items-start gap-6 hover:bg-slate-50 transition-colors">
              <div className={`w-3 h-3 rounded-full mt-1.5 ${notif.type === 'SUCCESS' ? 'bg-emerald-500' : notif.type === 'ALERT' ? 'bg-amber-500' : notif.type === 'DELAY' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h5 className="text-sm font-black text-slate-800 uppercase">{notif.title}</h5>
                  <span className="text-[10px] font-bold text-slate-300">{new Date(notif.created_at).toLocaleString('pt-BR')}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{notif.message}</p>
                {notif.event_date && <p className="text-[9px] font-black text-slate-300 uppercase mt-2">Vencimento: {notif.event_date}</p>}
              </div>
            </div>
          )) : (
            <div className="p-20 text-center opacity-20 font-black uppercase tracking-widest italic">Nenhuma notificação recente</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
