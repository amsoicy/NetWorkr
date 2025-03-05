import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminHeader() {
   const pathname = usePathname()

   return (
      <header className="bg-base-100 shadow-sm">
         <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
               <div className="flex items-center">
                  <Link href="/" className="text-xl font-bold">
                     NetWorkr
                  </Link>
               </div>

               <nav className="flex items-center space-x-4">
                  <Link
                     href="/admin"
                     className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === "/admin"
                           ? "bg-base-200 text-base-content"
                           : "text-base-content/70 hover:text-base-content hover:bg-base-200"
                     }`}
                  >
                     Dashboard
                  </Link>
                  <Link
                     href="/admin/users"
                     className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname === "/admin/users"
                           ? "bg-base-200 text-base-content"
                           : "text-base-content/70 hover:text-base-content hover:bg-base-200"
                     }`}
                  >
                     Users
                  </Link>
               </nav>
            </div>
         </div>
      </header>
   )
}
