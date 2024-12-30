import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  return {
    canManageTasksAndRoutines: user?.role === 'admin' || user?.canManageTasksAndRoutines === true,
    canAccessStatistics: user?.role === 'admin' || user?.canManageTasksAndRoutines === true,
    canAccessAdminStats: user?.role === 'admin',
    canManageUsers: user?.role === 'admin',
    canManageZones: user?.role === 'admin',
    isAuthenticated: !!user
  };
};

export default usePermissions;