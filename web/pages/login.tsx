import { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import Header from "@/components/header"

export default function Login() {
   const router = useRouter()
   const [username, setUsername] = useState("")
   const [password, setPassword] = useState("")
   const [error, setError] = useState("")
   const [isLoading, setIsLoading] = useState(false)

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      setIsLoading(true)

      try {
         const response = await fetch("http://localhost:3001/user/login", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
         })

         const data = await response.json()

         if (data.success) {
            // Store the token
            localStorage.setItem("token", data.token)
            // Redirect to home page
            router.push("/")
         } else {
            setError(data.error || "Login failed")
         }
      } catch (err: unknown) {
         setError("Failed to connect to server")
         if (err instanceof Error) {
            console.error("Login error:", err.message)
         }
      } finally {
         setIsLoading(false)
      }
   }

   return (
      <>
         <Header />
         <title>Identity Tracker | Login</title>

         <main className="min-h-screen bg-base-100 flex items-center justify-center">
            <div className="w-full max-w-md px-4">
               <div className="bg-base-200 rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-6 text-center text-base-content">Login</h2>

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
                           placeholder="Enter your username"
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
                     </div>

                     <div className="space-y-4">
                        <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
                           {isLoading ? "Logging in..." : "Login"}
                        </button>

                        <Link href="/register" className="btn btn-outline w-full">
                           Create a new account
                        </Link>
                     </div>
                  </form>
               </div>
            </div>
         </main>
      </>
   )
}
