// Role-Based Access Control (RBAC) sistemi

export type Role = 'admin' | 'manager' | 'viewer'
export type Action = 'read' | 'write' | 'delete' | 'manage'

export interface User {
  id: string
  role: Role
  orgId: string
}

// Rol yetkileri
const ROLE_PERMISSIONS: Record<Role, Action[]> = {
  admin: ['read', 'write', 'delete', 'manage'],
  manager: ['read', 'write'],
  viewer: ['read'],
}

// Yetki kontrolü
export function can(user: User, action: Action, targetOrgId?: string): boolean {
  // Farklı organizasyondaki kullanıcı erişemez
  if (targetOrgId && user.orgId !== targetOrgId) {
    return false
  }

  // Rol yetkilerini kontrol et
  return ROLE_PERMISSIONS[user.role].includes(action)
}

// Spesifik yetki kontrolleri
export function canRead(user: User, targetOrgId?: string): boolean {
  return can(user, 'read', targetOrgId)
}

export function canWrite(user: User, targetOrgId?: string): boolean {
  return can(user, 'write', targetOrgId)
}

export function canDelete(user: User, targetOrgId?: string): boolean {
  return can(user, 'delete', targetOrgId)
}

export function canManage(user: User, targetOrgId?: string): boolean {
  return can(user, 'manage', targetOrgId)
}

// Rol seviyesi karşılaştırması
export function hasHigherRole(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    admin: 3,
    manager: 2,
    viewer: 1,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Kullanıcı rolünü güncelleme yetkisi
export function canUpdateRole(currentUser: User, targetUserRole: Role): boolean {
  // Sadece admin başka admin oluşturabilir
  if (targetUserRole === 'admin') {
    return currentUser.role === 'admin'
  }

  // Admin ve manager diğer roller için yetkili
  return ['admin', 'manager'].includes(currentUser.role)
}
