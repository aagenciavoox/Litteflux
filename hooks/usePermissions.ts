import { useState, useEffect } from 'react';
import { auth, supabase } from '../services/supabase';
import { UserProfile } from '../types';

/**
 * Hook personalizado para verificar permissões do usuário
 * 
 * @example
 * const { hasPermission, isAdmin, loading } = usePermissions(userId);
 * 
 * if (hasPermission('campaigns', 'edit')) {
 *   // Mostrar botão de editar
 * }
 */
export const usePermissions = (userId: string | undefined) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadProfile = async (targetId?: string) => {
            try {
                setLoading(true);

                // Se não foi informado userId, obter usuário da sessão atual
                let id = targetId;
                if (!id) {
                    const session = await supabase.auth.getUser();
                    id = session?.data?.user?.id;
                }

                if (!id) {
                    if (mounted) {
                        setProfile(null);
                        setError(null);
                        setLoading(false);
                    }
                    return;
                }

                const userProfile = await auth.getProfileWithPermissions(id);
                if (mounted) {
                    setProfile(userProfile);
                    setError(null);
                }
            } catch (err) {
                console.error('Erro ao carregar permissões:', err);
                if (mounted) setError('Erro ao carregar permissões');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadProfile(userId);

        return () => {
            mounted = false;
        };
    }, [userId]);

    /**
     * Verifica se o usuário tem uma permissão específica
     * @param module - Nome do módulo (ex: 'campaigns', 'users')
     * @param action - Ação desejada (ex: 'view', 'edit', 'create', 'delete')
     * @returns true se o usuário tem a permissão, false caso contrário
     */
    const hasPermission = (module: string, action: 'view' | 'edit' | 'create' | 'delete'): boolean => {
        if (!profile) return false;

        // Admin tem todas as permissões
        if (profile.is_admin) return true;

        // Verificar permissão específica
        return profile.permissions?.[module]?.[action] === true;
    };

    /**
     * Verifica se o usuário é administrador
     */
    const isAdmin = profile?.is_admin === true;

    /**
     * Verifica se o usuário tem pelo menos uma permissão em um módulo
     */
    const hasAnyPermission = (module: string): boolean => {
        if (!profile) return false;
        if (profile.is_admin) return true;

        const modulePerms = profile.permissions?.[module];
        if (!modulePerms) return false;

        return Object.values(modulePerms).some(perm => perm === true);
    };

    /**
     * Retorna todas as permissões do usuário para um módulo
     */
    const getModulePermissions = (module: string) => {
        if (!profile) return { view: false, edit: false, create: false, delete: false };
        if (profile.is_admin) return { view: true, edit: true, create: true, delete: true };

        return profile.permissions?.[module] || { view: false, edit: false, create: false, delete: false };
    };

    return {
        profile,
        loading,
        error,
        hasPermission,
        isAdmin,
        hasAnyPermission,
        getModulePermissions
    };
};

/**
 * Componente de exemplo de uso
 * 
 * @example
 * function CampaignList() {
 *   const { user } = useAuth();
 *   const { hasPermission, isAdmin } = usePermissions(user?.id);
 * 
 *   return (
 *     <div>
 *       {hasPermission('campaigns', 'view') && (
 *         <CampaignTable />
 *       )}
 *       
 *       {hasPermission('campaigns', 'create') && (
 *         <button onClick={createCampaign}>Nova Campanha</button>
 *       )}
 *       
 *       {isAdmin && (
 *         <AdminPanel />
 *       )}
 *     </div>
 *   );
 * }
 */
