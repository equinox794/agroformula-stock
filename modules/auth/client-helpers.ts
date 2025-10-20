'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return { user, loading }
}

export function useProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }

    getProfile()
  }, [supabase])

  return { profile, loading }
}

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getOrganizations = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('memberships')
          .select(`
            org_id,
            role,
            organizations (
              id,
              name,
              owner_id
            )
          `)
          .eq('user_id', user.id)
        setOrganizations(data || [])
      }
      setLoading(false)
    }

    getOrganizations()
  }, [supabase])

  return { organizations, loading }
}

export function useCurrentOrganization() {
  const [currentOrg, setCurrentOrg] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getCurrentOrg = async () => {
      const orgId = localStorage.getItem('currentOrgId')
      if (orgId) {
        const { data } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single()
        setCurrentOrg(data)
      }
      setLoading(false)
    }

    getCurrentOrg()
  }, [supabase])

  const setCurrentOrganization = (orgId: string) => {
    localStorage.setItem('currentOrgId', orgId)
    setCurrentOrg({ id: orgId })
  }

  return { currentOrg, setCurrentOrganization, loading }
}
