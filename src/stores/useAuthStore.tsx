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
    try {
      // Slack Workspace Validation
      const slackIdentity = sbUser.identities?.find(
        (id) => id.provider === 'slack',
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

      // Auto-registration and Upsert Logic
      let employee = null

      // Find existing employee safely
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
        // Update existing employee with Slack profile data if provided
        const updates: any = {}
        const nameFromProvider =
          sbUser.user_metadata?.full_name || sbUser.user_metadata?.name
        const avatarFromProvider = sbUser.user_metadata?.avatar_url

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
        // Insert new employee for this Slack user
        const name =
          sbUser.user_metadata?.full_name ||
          sbUser.user_metadata?.name ||
          sbUser.email.split('@')[0]
        const avatarUrl = sbUser.user_metadata?.avatar_url || null

        const { data: newEmp } = await supabase
          .from('employees')
          .insert({
            id: sbUser.id,
            email: sbUser.email,
            name: name,
            avatar_url: avatarUrl,
            role: 'Colaborador',
          })
          .select()
          .maybeSingle()
        if (newEmp) employee = newEmp
      }

      let role: 'admin' | 'user' = 'user'

      // Check role from database
      if (employee?.role === 'admin') {
        role = 'admin'
      }

      // Fallback: Ensure admin@adapta.org is always admin (useful for first login/recovery)
      if (sbUser.email === 'admin@adapta.org') {
        role = 'admin'
      }

      const nameToUse =
        employee?.name ||
        sbUser.user_metadata?.full_name ||
        sbUser.user_metadata?.name ||
        sbUser.email?.split('@')[0].replace('.', ' ') ||
        'Usuário'

      const avatarToUse =
        employee?.avatar_url ||
        sbUser.user_metadata?.avatar_url ||
        `https://img.usecurling.com/ppl/medium?gender=male&seed=${sbUser.email}`

      return {
        id: employee?.id || sbUser.id,
        name: nameToUse.charAt(0).toUpperCase() + nameToUse.slice(1),
        email: employee?.email || sbUser.email || '',
        avatar: avatarToUse,
        role,
      }
    } catch (error: any) {
      console.error('Error mapping user:', error)
      if (error.message.includes('Acesso negado')) {
        throw error // Propagate explicitly to be caught by the unhandled promise rejection
      }
      // Fallback safe user
      return {
        id: sbUser.id,
        name: 'Usuário',
        email: sbUser.email || '',
        avatar: '',
        role: 'user',
      }
    }
  }

  useEffect(() => {
    // Listen for auth changes
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

    // Check initial session
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
        provider: 'slack',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })
      return { data, error }
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
