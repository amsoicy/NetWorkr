import { useEffect } from "react"
import { useRouter } from "next/router"
import Header from "@/components/header"

export default function BannedPage() {
   const router = useRouter()

   useEffect(() => {
      // Clear any stored auth data
      localStorage.removeItem("token")
      localStorage.removeItem("user")
   }, [])

   return (
      <>m 
         <Header />
         <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <div className="text-center">
               <h1 className="text-4xl font-bold text-error mb-4">Account Banned</h1>
               <p className="text-xl mb-8">
                  Your account has been banned. Please contact an administrator for more information.
               </p>
               <button className="btn btn-primary" onClick={() => router.push("/login")}>
                  Return to Login
               </button>
            </div>
         </main>
      </>
   )
}
