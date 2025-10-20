import { describe, it, expect } from 'vitest'
import {
  can,
  canRead,
  canWrite,
  canDelete,
  canManage,
  hasHigherRole,
  canUpdateRole,
  type User,
} from '@/lib/rbac'

describe('RBAC', () => {
  const adminUser: User = {
    id: '1',
    role: 'admin',
    orgId: 'org1',
  }

  const managerUser: User = {
    id: '2',
    role: 'manager',
    orgId: 'org1',
  }

  const viewerUser: User = {
    id: '3',
    role: 'viewer',
    orgId: 'org1',
  }

  const otherOrgUser: User = {
    id: '4',
    role: 'admin',
    orgId: 'org2',
  }

  describe('can', () => {
    it('should allow admin to perform all actions', () => {
      expect(can(adminUser, 'read', 'org1')).toBe(true)
      expect(can(adminUser, 'write', 'org1')).toBe(true)
      expect(can(adminUser, 'delete', 'org1')).toBe(true)
      expect(can(adminUser, 'manage', 'org1')).toBe(true)
    })

    it('should allow manager to read and write', () => {
      expect(can(managerUser, 'read', 'org1')).toBe(true)
      expect(can(managerUser, 'write', 'org1')).toBe(true)
      expect(can(managerUser, 'delete', 'org1')).toBe(false)
      expect(can(managerUser, 'manage', 'org1')).toBe(false)
    })

    it('should only allow viewer to read', () => {
      expect(can(viewerUser, 'read', 'org1')).toBe(true)
      expect(can(viewerUser, 'write', 'org1')).toBe(false)
      expect(can(viewerUser, 'delete', 'org1')).toBe(false)
      expect(can(viewerUser, 'manage', 'org1')).toBe(false)
    })

    it('should deny access to different organization', () => {
      expect(can(adminUser, 'read', 'org2')).toBe(false)
      expect(can(managerUser, 'write', 'org2')).toBe(false)
      expect(can(viewerUser, 'read', 'org2')).toBe(false)
    })
  })

  describe('canRead', () => {
    it('should allow all roles to read in their org', () => {
      expect(canRead(adminUser, 'org1')).toBe(true)
      expect(canRead(managerUser, 'org1')).toBe(true)
      expect(canRead(viewerUser, 'org1')).toBe(true)
    })
  })

  describe('canWrite', () => {
    it('should allow admin and manager to write', () => {
      expect(canWrite(adminUser, 'org1')).toBe(true)
      expect(canWrite(managerUser, 'org1')).toBe(true)
      expect(canWrite(viewerUser, 'org1')).toBe(false)
    })
  })

  describe('canDelete', () => {
    it('should only allow admin to delete', () => {
      expect(canDelete(adminUser, 'org1')).toBe(true)
      expect(canDelete(managerUser, 'org1')).toBe(false)
      expect(canDelete(viewerUser, 'org1')).toBe(false)
    })
  })

  describe('canManage', () => {
    it('should only allow admin to manage', () => {
      expect(canManage(adminUser, 'org1')).toBe(true)
      expect(canManage(managerUser, 'org1')).toBe(false)
      expect(canManage(viewerUser, 'org1')).toBe(false)
    })
  })

  describe('hasHigherRole', () => {
    it('should compare roles correctly', () => {
      expect(hasHigherRole('admin', 'manager')).toBe(true)
      expect(hasHigherRole('admin', 'viewer')).toBe(true)
      expect(hasHigherRole('manager', 'viewer')).toBe(true)
      expect(hasHigherRole('manager', 'admin')).toBe(false)
      expect(hasHigherRole('viewer', 'admin')).toBe(false)
      expect(hasHigherRole('viewer', 'manager')).toBe(false)
    })
  })

  describe('canUpdateRole', () => {
    it('should allow admin to update any role', () => {
      expect(canUpdateRole(adminUser, 'admin')).toBe(true)
      expect(canUpdateRole(adminUser, 'manager')).toBe(true)
      expect(canUpdateRole(adminUser, 'viewer')).toBe(true)
    })

    it('should allow manager to update non-admin roles', () => {
      expect(canUpdateRole(managerUser, 'admin')).toBe(false)
      expect(canUpdateRole(managerUser, 'manager')).toBe(true)
      expect(canUpdateRole(managerUser, 'viewer')).toBe(true)
    })

    it('should not allow viewer to update any role', () => {
      expect(canUpdateRole(viewerUser, 'admin')).toBe(false)
      expect(canUpdateRole(viewerUser, 'manager')).toBe(false)
      expect(canUpdateRole(viewerUser, 'viewer')).toBe(false)
    })
  })
})
