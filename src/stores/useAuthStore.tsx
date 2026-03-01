import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'admin' | 'user'
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  session: Session | null
  login: (
    email: string,
    password?: string,
  ) => Promise<{ data?: any; error: AuthError | Error | null }>
  loginWithSlack: () => Promise<{ data?: any; error: AuthError | Error | null }>
  logout: () => Promise<void>
  isLoading: boolean
  updateProfile: (data: { name: string; avatar?: string }) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const mapSupabaseUserToAppUser = async (
    sbUser: SupabaseUser,
  ): Promise<User> => {
    // 1. Slack Workspace Validation
    const slackIdentity = sbUser.identities?.find(
      (id) => id.provider === 'slack' || id.provider === 'slack_oidc',
    )

    if (slackIdentity) {
      const teamId =
        slackIdentity.identity_data?.team_id || sbUser.user_metadata?.team_id
      const allowedTeamId = import.meta.env.VITE_ALLOWED_SLACK_TEAM_ID

      if (
        allowedTeamId &&
        allowedTeamId !== 'placeholder' &&
        teamId &&
        teamId !== allowedTeamId
      ) {
        throw new Error(
          'Acesso negado. Você não faz parte do Workspace oficial da Adapta no Slack.',
        )
      }
    }

    // 2. Data Extraction
    const nameFromProvider =
      sbUser.user_metadata?.full_name ||
      sbUser.user_metadata?.name ||
      sbUser.email?.split('@')[0] ||
      'Usuário'
    const avatarFromProvider =
      sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || null

    let employee = null

    // 3. Auto-registration and Upsert Logic
    try {
      let { data: empById } = await supabase
        .from('employees')
        .select('*')
        .eq('id', sbUser.id)
        .maybeSingle()

      employee = empById

      if (!employee && sbUser.email) {
        const { data: empByEmail } = await supabase
          .from('employees')
          .select('*')
          .eq('email', sbUser.email)
          .limit(1)
          .maybeSingle()

        employee = empByEmail
      }

      if (employee) {
        const updates: any = {}

        if (nameFromProvider && employee.name !== nameFromProvider) {
          updates.name = nameFromProvider
        }
        if (avatarFromProvider && employee.avatar_url !== avatarFromProvider) {
          updates.avatar_url = avatarFromProvider
        }

        if (Object.keys(updates).length > 0) {
          const { data: updatedEmp } = await supabase
            .from('employees')
            .update(updates)
            .eq('id', employee.id)
            .select()
            .maybeSingle()
          if (updatedEmp) employee = updatedEmp
        }
      } else if (sbUser.email) {
        const { data: newEmp } = await supabase
          .from('employees')
          .insert({
            id: sbUser.id,
            email: sbUser.email,
            name: nameFromProvider,
            avatar_url: avatarFromProvider,
            role: 'Colaborador',
          })
          .select()
          .maybeSingle()
        if (newEmp) employee = newEmp
      }
    } catch (dbError) {
      console.error('Error during employee upsert/fetch:', dbError)
    }

    // 4. Role & Mapping
    let role: 'admin' | 'user' = 'user'

    if (employee?.role === 'admin') {
      role = 'admin'
    }

    if (sbUser.email === 'admin@adapta.org') {
      role = 'admin'
    }

    const nameToUse = employee?.name || nameFromProvider
    const avatarToUse =
      employee?.avatar_url ||
      avatarFromProvider ||
      `https://img.usecurling.com/ppl/medium?gender=male&seed=${sbUser.email}`

    return {
      id: employee?.id || sbUser.id,
      name: nameToUse.charAt(0).toUpperCase() + nameToUse.slice(1),
      email: employee?.email || sbUser.email || '',
      avatar: avatarToUse,
      role,
    }
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        setIsAuthenticated(true)
        setIsLoading(true)
        mapSupabaseUserToAppUser(session.user)
          .then((appUser) => {
            setUser(appUser)
            setIsLoading(false)
          })
          .catch((err) => {
            supabase.auth.signOut().then(() => {
              setUser(null)
              setIsAuthenticated(false)
              setIsLoading(false)
              toast({
                title: 'Acesso Negado',
                description: err.message,
                variant: 'destructive',
              })
            })
          })
      } else {
        setUser(null)
        setIsAuthenticated(false)
        setIsLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        setIsAuthenticated(true)
        setIsLoading(true)
        mapSupabaseUserToAppUser(session.user)
          .then((appUser) => {
            setUser(appUser)
            setIsLoading(false)
          })
          .catch((err) => {
            supabase.auth.signOut().then(() => {
              setUser(null)
              setIsAuthenticated(false)
              setIsLoading(false)
              toast({
                title: 'Acesso Negado',
                description: err.message,
                variant: 'destructive',
              })
            })
          })
      } else {
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password?: string) => {
    try {
      if (!password) {
        return { error: new Error('A senha é obrigatória para autenticação') }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { data, error }
    } catch (error: any) {
      return { error }
    }
  }

  const loginWithSlack = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'slack_oidc',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })
      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setIsAuthenticated(false)
  }

  const updateProfile = async (data: { name: string; avatar?: string }) => {
    if (!user) return

    const { error } = await supabase.auth.updateUser({
      data: {
        name: data.name,
        avatar_url: data.avatar,
      },
    })

    if (!error) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              name: data.name,
              avatar: data.avatar || prev.avatar,
            }
          : null,
      )
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        session,
        login,
        loginWithSlack,
        logout,
        isLoading,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default function useAuthStore() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthStore must be used within an AuthProvider')
  }
  return context
}
