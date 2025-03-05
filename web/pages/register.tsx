import { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import Header from "@/components/header"

export default function Register() {
   const router = useRouter()
   const [username, setUsername] = useState("")
   const [password, setPassword] = useState("")
   const [confirmPassword, setConfirmPassword] = useState("")
   const [inviteCode, setInviteCode] = useState("")
   const [error, setError] = useState("")
   const [isLoading, setIsLoading] = useState(false)
   const [passwordError, setPasswordError] = useState("")

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      setPasswordError("")

      // Client-side validation
      if (password !== confirmPassword) {
         setError("Passwords do not match")
         return
      }

      // Password validation
      if (password.length < 8) {
         setPasswordError("Password must be at least 8 characters long")
         return
      }

      if (!/(?=.*[0-9!@#$%^&*])/.test(password)) {
         setPasswordError("Password must include at least one number or special character")
         return
      }

      setIsLoading(true)

      try {
         const response = await fetch("http://localhost:3001/user", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({
               username,
               password,
               code: inviteCode
            })
         })

         const data = await response.json()

         if (data.success) {
            // Store the token
            localStorage.setItem("token", data.token)

            // Check if user is banned
            const userResponse = await fetch("http://localhost:3001/user/isAdmin", {
               headers: {
                  Authorization: `Bearer ${data.token}`
               }
            })
            const userData = await userResponse.json()

            if (!userData.success) {
               if (userData.error === "Account is banned") {
                  localStorage.removeItem("token")
                  router.push("/banned")
                  return
               }
               setError(userData.error || "Registration failed")
               return
            }

            if (userData.user && userData.user.banned === true) {
               localStorage.removeItem("token")
               router.push("/banned")
               return
            }

            // Redirect to home page
            router.push("/")
         } else {
            setError(data.error || "Registration failed")
         }
      } catch (err: unknown) {
         setError("Failed to connect to server")
         if (err instanceof Error) {
            console.error("Registration error:", err.message)
         }
      } finally {
         setIsLoading(false)
      }
   }

   return (
      <>
         <Header />
         <title>Identity Tracker | Register</title>

         <main className="min-h-screen bg-base-100 flex items-center justify-center">
            <div className="w-full max-w-md px-4">
               <div className="bg-base-200 rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-6 text-center text-base-content">Create Account</h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                     {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
                     )}

                     <div className="space-y-2">
                        <label htmlFor="username" className="block text-sm font-medium text-base-content">
                           Username
                        </label>
                        <input
                           id="username"
                           type="text"
                           value={username}
                           onChange={(e) => setUsername(e.target.value)}
                           className="input w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                           placeholder="Enter your desired username"
                           required
                        />
                     </div>

                     <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-base-content">
                           Password
                        </label>
                        <input
                           id="password"
                           type="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="input w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                           placeholder="Enter your password"
                           required
                        />
                        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                     </div>

                     <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-base-content">
                           Confirm password
                        </label>
                        <input
                           id="confirmPassword"
                           type="password"
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           className="input w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                           placeholder="Confirm your password"
                           required
                        />
                     </div>

                     <div className="space-y-2">
                        <label htmlFor="inviteCode" className="block text-sm font-medium text-base-content">
                           Registration code
                        </label>
                        <input
                           id="inviteCode"
                           type="text"
                           value={inviteCode}
                           onChange={(e) => setInviteCode(e.target.value)}
                           className="input w-full px-3 py-2 bg-base-100 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                           placeholder="Enter your registration code"
                           required
                        />
                     </div>

                     <div className="space-y-4">
                        <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
                           {isLoading ? "Creating Account..." : "Create Account"}
                        </button>

                        <Link href="/login" className="btn btn-outline w-full">
                           Sign in to an existing account
                        </Link>
                     </div>
                  </form>
               </div>
            </div>
         </main>
      </>
   )
}
