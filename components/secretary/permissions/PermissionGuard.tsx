'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import { checkPermission, SecretaryPermissions } from '@/lib/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  resource: keyof SecretaryPermissions;
  action: 'view' | 'edit' | 'manage';
  fallback?: ReactNode;
}

export function PermissionGuard({ 
  children, 
  resource, 
  action, 
  fallback 
}: PermissionGuardProps) {
  const { user } = useAuth();

  // Allow access for doctors and admins
  if (user?.role === 'doctor' || user?.role === 'admin') {
    return <>{children}</>;
  }

  // Check secretary permissions
  if (user?.role === 'secretary') {
    const hasPermission = checkPermission(
      user.profile?.permissions || {},
      resource,
      action
    );

    if (hasPermission) {
      return <>{children}</>;
    }
  }

  return (
    <>
      {fallback || (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-sm">
            You don't have permission to {action} {resource}
          </p>
        </div>
      )}
    </>
  );
}