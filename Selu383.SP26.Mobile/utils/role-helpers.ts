

export function normalizeRoles(roles: string[] | undefined): string[] {
  if (!roles) return [];
  return roles.map((r) => r.toLowerCase());
}

export function hasRole(roles: string[] | undefined, roleName: string): boolean {
  const normalized = normalizeRoles(roles);
  return normalized.includes(roleName.toLowerCase());
}

export function getUserPermissions(roles: string[] | undefined) {
  const normalized = normalizeRoles(roles);
  return {
    isAdmin: normalized.includes('admin'),
    isManager: normalized.includes('manager'),
    isStaff: normalized.includes('staff'),
    isPrivileged: ['admin', 'manager', 'staff'].some((r) =>
      normalized.includes(r)
    ),
  };
}
