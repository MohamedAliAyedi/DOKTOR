export interface Permission {
  view: boolean;
  edit: boolean;
  manage: boolean;
}

export interface SecretaryPermissions {
  appointments: Permission;
  patients: Permission;
  billing: Permission;
  consultations: Permission;
  medicalRecords: Permission;
}

export const defaultSecretaryPermissions: SecretaryPermissions = {
  appointments: { view: true, edit: true, manage: false },
  patients: { view: true, edit: false, manage: false },
  billing: { view: true, edit: true, manage: false },
  consultations: { view: true, edit: false, manage: false },
  medicalRecords: { view: true, edit: false, manage: false },
};

export const checkPermission = (
  userPermissions: SecretaryPermissions,
  resource: keyof SecretaryPermissions,
  action: keyof Permission
): boolean => {
  return userPermissions[resource]?.[action] || false;
};

export const hasAnyPermission = (
  userPermissions: SecretaryPermissions,
  resource: keyof SecretaryPermissions
): boolean => {
  const resourcePermissions = userPermissions[resource];
  return resourcePermissions?.view || resourcePermissions?.edit || resourcePermissions?.manage || false;
};