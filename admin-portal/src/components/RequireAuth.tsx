/**
 * RequireAuth — RBAC route guard (FIX-06).
 *
 * Wraps any admin route. Behavior:
 *   - Unauthenticated users are redirected to /login (preserves return path)
 *   - Authenticated users without the required permission are redirected to /403
 *   - Authenticated users with permission see the page
 *
 * Usage:
 *   <Route path="fraud" element={
 *     <RequireAuth permission="fraud.view">
 *       <Fraud />
 *     </RequireAuth>
 *   } />
 *
 * Permission catalog: see admin-portal/src/store/authStore.ts (Permission type).
 */

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { Permission } from '@/store/authStore';

interface RequireAuthProps {
  children: ReactNode;
  /** Required permission; omit to only require authentication. */
  permission?: Permission;
}

export default function RequireAuth({ children, permission }: RequireAuthProps) {
  const location = useLocation();
  const { isAuthenticated, currentAdmin, checkPermission } = useAuthStore();

  // 1. Not logged in → /login (with return path)
  if (!isAuthenticated || !currentAdmin) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 2. Logged in but missing permission → /403
  if (permission && !checkPermission(permission)) {
    return <Navigate to="/403" replace />;
  }

  // 3. Allowed → render children
  return <>{children}</>;
}