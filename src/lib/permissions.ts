const rolePermissions: Record<string, string[]> = {
    admin: ['orders:*', 'products:*', 'inventory:*', 'users:*'],
    manager: ['orders:*', 'products:read', 'inventory:read'],
    staff: ['orders:read', 'orders:update:status', 'products:read'],
};

export function derivePermissions(roles: string[]): string[] {
    // @ts-ignore
    const all = new Set<string>();
    for (const role of roles) {
        (rolePermissions[role] ?? []).forEach((p) => all.add(p));
    }
    return [...all];
}