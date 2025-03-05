import { useState, useEffect } from "react"
import { useRouter } from "next/router"

interface User {
   id: string
   username: string
   permissions: number
   banned: boolean
}

export function useAuth(requireAdmin = false) {
   const [user, setUser] = useState<User | null>(null)
   const [loading, setLoading] = useState(true)
   const router = useRouter()

   useEffect(() => {
      const checkAuth = async () => {
         try {
            const token = localStorage.getItem("token")
            if (!token) {
               setLoading(false)
               return
            }

            // First verify the token and get user data
            const userResponse = await fetch("http://localhost:3001/user/isAdmin", {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            })
            const userData = await userResponse.json()
            console.log("Auth response:", userData) // Debug log

            if (!userData.success) {
               if (userData.error === "Account is banned") {
                  console.log("User is banned, redirecting to banned page") // Debug log
                  localStorage.removeItem("token")
                  localStorage.removeItem("user")
                  router.push("/banned")
                  return
               }
               localStorage.removeItem("token")
               localStorage.removeItem("user")
               setLoading(false)
               return
            }

            // Check if user is banned
            if (userData.user && userData.user.banned === true) {
               console.log("User is banned, redirecting to banned page") // Debug log
               localStorage.removeItem("token")
               localStorage.removeItem("user")
               router.push("/banned")
               return
            }

            // Check admin access if required
            if (requireAdmin && userData.user && userData.user.permissions !== 1) {
               router.push("/")
               setLoading(false)
               return
            }

            setUser(userData.user)
         } catch (error) {
            console.error("Auth check failed:", error)
            localStorage.removeItem("token")
            localStorage.removeItem("user")
         } finally {
            setLoading(false)
         }
      }

      checkAuth()
   }, [requireAdmin, router])

   return { user, loading }
}
