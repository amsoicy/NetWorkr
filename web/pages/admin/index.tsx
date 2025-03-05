import { useState, useEffect } from "react"
import Header from "@/components/header"
import { useAuth } from "@/hooks/useAuth"

export default function AdminPage() {
   const { user, loading } = useAuth(true) // Require admin access
   const [invites, setInvites] = useState<Array<{ code: string; createdBy: string }>>([])
   const [error, setError] = useState("")

   useEffect(() => {
      if (user) {
         fetchInvites()
      }
   }, [user])

   const fetchInvites = async () => {
      try {
         const token = localStorage.getItem("token")
         const response = await fetch("http://localhost:3001/invite", {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = await response.json()
         if (data.success) {
            setInvites(data.invites)
         } else {
            setError(data.error || "Failed to fetch invites")
         }
      } catch (err) {
         setError("Failed to connect to server")
         console.error("Error fetching invites:", err)
      }
   }

   const createInvite = async () => {
      try {
         const response = await fetch("http://localhost:3001/invite", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ userid: user?.id })
         })
         const data = await response.json()
         if (data.success) {
            fetchInvites() // Refresh the list
         } else {
            setError(data.error || "Failed to create invite")
         }
      } catch (err) {
         setError("Failed to connect to server")
         console.error("Error creating invite:", err)
      }
   }

   const deleteInvite = async (code: string) => {
      try {
         const response = await fetch(`http://localhost:3001/invite/${code}`, {
            method: "DELETE",
            headers: {
               Authorization: `Bearer ${localStorage.getItem("token")}`
            }
         })
         const data = await response.json()
         if (data.success) {
            fetchInvites() // Refresh the list
         } else {
            setError(data.error || "Failed to delete invite")
         }
      } catch (err) {
         setError("Failed to connect to server")
         console.error("Error deleting invite:", err)
      }
   }

   if (loading) {
      return <div>Loading...</div>
   }

   return (
      <>
         <Header />
         <title>Identity Tracker | Admin</title>

         <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="bg-base-200 rounded-lg p-6 mb-8">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Invite Codes</h2>
                  <button onClick={createInvite} className="btn btn-primary">
                     Generate New Invite
                  </button>
               </div>

               {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
               )}

               <div className="overflow-x-auto">
                  <table className="table w-full">
                     <thead>
                        <tr>
                           <th>Invite Code</th>
                           <th>Created By</th>
                           <th>Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {invites.map((invite) => (
                           <tr key={invite.code}>
                              <td className="font-mono">{invite.code}</td>
                              <td>{invite.createdBy}</td>
                              <td>
                                 <button onClick={() => deleteInvite(invite.code)} className="btn btn-error btn-sm">
                                    Delete
                                 </button>
                              </td>
                           </tr>
                        ))}
                        {invites.length === 0 && (
                           <tr>
                              <td colSpan={3} className="text-center py-4">
                                 No invite codes found
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </main>
      </>
   )
}
