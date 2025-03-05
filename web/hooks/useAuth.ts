import { useState, useEffect } from "react"
import { useRouter } from "next/router"

interface AuthUser {
   id: string
   username: string
   permissions: number
}

export function useAuth(requireAdmin: boolean = false) {
   const [user, setUser] = useState<AuthUser | null>(null)
   const [loading, setLoading] = useState(true)
   const router = useRouter()

   useEffect(() => {
      const token = localStorage.getItem("token")
      if (!token) {
         router.push("/login")
         return
      }

      try {
         const decoded = JSON.parse(atob(token.split(".")[1])) as AuthUser
         if (requireAdmin && decoded.permissions !== 1) {
            router.push("/")
            return
         }
         setUser(decoded)
      } catch (err) {
         console.error("Error decoding token:", err)
         localStorage.removeItem("token")
         router.push("/login")
      } finally {
         setLoading(false)
      }
   }, [requireAdmin, router])

   return { user, loading }
}
