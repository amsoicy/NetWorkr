import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"

export default function Header() {
   const router = useRouter()
   const [username, setUsername] = useState<string | null>(null)

   useEffect(() => {
      // Check if user is logged in
      const token = localStorage.getItem("token")
      if (token) {
         try {
            const decoded = JSON.parse(atob(token.split(".")[1]))
            setUsername(decoded.username)
         } catch (err) {
            console.error("Error decoding token:", err)
         }
      }
   }, [])

   const handleLogout = () => {
      localStorage.removeItem("token")
      setUsername(null)
      router.push("/login")
   }

   return (
      <div className="navbar bg-base-100">
         <div className="flex-1 gap-4">
            <Link href="/" className="text-xl">
               idTracker
            </Link>
            {username && <span className="text-base-content/70">@{username}</span>}
         </div>
         <div className="flex-none">
            <div className="dropdown dropdown-end">
               <button tabIndex={0} className="btn btn-square btn-ghost">
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     className="inline-block h-5 w-5 stroke-current"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                     ></path>
                  </svg>
               </button>
               <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-200 rounded-box w-52">
                  {username ? (
                     <li>
                        <button onClick={handleLogout} className="text-error">
                           Logout
                        </button>
                     </li>
                  ) : (
                     <li>
                        <button onClick={() => router.push("/login")} className="text-primary">
                           Login
                        </button>
                     </li>
                  )}
               </ul>
            </div>
         </div>
      </div>
   )
}
