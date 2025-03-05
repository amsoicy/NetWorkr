import { useState, useEffect } from "react"
import AdminHeader from "@/components/adminHeader"
import { useAuth } from "@/hooks/useAuth"

interface User {
   id: string
   username: string
   permissions: number
   invitedBy: string
   createdAt: string
}

interface Invite {
   code: string
   createdBy: string
   createdAt: string
}

interface Pagination {
   total: number
   page: number
   limit: number
   totalPages: number
}

export default function AdminPage() {
   const { user, loading } = useAuth(true) // Require admin access
   const [invites, setInvites] = useState<Invite[]>([])
   const [latestUsers, setLatestUsers] = useState<User[]>([])
   const [error, setError] = useState("")
   const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null)
   const [assignUsername, setAssignUsername] = useState("")
   const [currentPage, setCurrentPage] = useState(1)
   const [pagination, setPagination] = useState<Pagination | null>(null)

   useEffect(() => {
      if (user) {
         fetchInvites()
         fetchLatestUsers()
      }
   }, [user, currentPage])

   const fetchInvites = async () => {
      try {
         const token = localStorage.getItem("token")
         const response = await fetch(`http://localhost:3001/invite?page=${currentPage}&limit=10`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = await response.json()
         if (data.success) {
            setInvites(data.invites)
            setPagination(data.pagination)
         } else {
            setError(data.error || "Failed to fetch invites")
         }
      } catch (err) {
         setError("Failed to connect to server")
         console.error("Error fetching invites:", err)
      }
   }

   const fetchLatestUsers = async () => {
      try {
         const token = localStorage.getItem("token")
         const response = await fetch("http://localhost:3001/user/latest", {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = await response.json()
         if (data.success) {
            setLatestUsers(data.users)
         } else {
            setError(data.error || "Failed to fetch latest users")
         }
      } catch (err) {
         setError("Failed to connect to server")
         console.error("Error fetching latest users:", err)
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

   const assignInvite = async () => {
      if (!selectedInvite) return

      try {
         const response = await fetch(`http://localhost:3001/invite/${selectedInvite.code}/assign`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ username: assignUsername })
         })
         const data = await response.json()
         if (data.success) {
            fetchInvites() // Refresh the list
            setSelectedInvite(null)
            setAssignUsername("")
         } else {
            setError(data.error || "Failed to assign invite")
         }
      } catch (err) {
         setError("Failed to connect to server")
         console.error("Error assigning invite:", err)
      }
   }

   if (loading) {
      return <div>Loading...</div>
   }

   return (
      <>
         <AdminHeader />
         <title>Identity Tracker | Admin</title>

         <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin dashboard</h1>

            {error && (
               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
            )}

            {/* Latest Users Section */}
            <div className="bg-base-200 rounded-lg p-6 mb-8">
               <h2 className="text-2xl font-semibold mb-6">Latest registrations</h2>
               <div className="overflow-x-auto">
                  <table className="table w-full">
                     <thead>
                        <tr>
                           <th className="border-b border-base-300">Username</th>
                           <th className="border-b border-base-300">Role</th>
                           <th className="border-b border-base-300">Invited by</th>
                           <th className="border-b border-base-300">Registration date</th>
                        </tr>
                     </thead>
                     <tbody>
                        {latestUsers.map((user) => (
                           <tr key={user.id} className="hover:bg-base-300 even:bg-base-200">
                              <td>{user.username}</td>
                              <td>{user.permissions === 1 ? "admin" : "user"}</td>
                              <td>{user.invitedBy || "N/A"}</td>
                              <td>{new Date(user.createdAt).toLocaleString()}</td>
                           </tr>
                        ))}
                        {latestUsers.length === 0 && (
                           <tr>
                              <td colSpan={4} className="text-center py-4">
                                 No users found
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Invite Codes Section */}
            <div className="bg-base-200 rounded-lg p-6 mb-8">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Latest registration codes</h2>
                  <button onClick={createInvite} className="btn btn-primary">
                     Generate code
                  </button>
               </div>

               <div className="overflow-x-auto">
                  <table className="table w-full">
                     <thead>
                        <tr>
                           <th className="border-b border-base-300">Invite Code</th>
                           <th className="border-b border-base-300">Owned by</th>
                           <th className="border-b border-base-300">Created At</th>
                           <th className="border-b border-base-300">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {invites.map((invite) => (
                           <tr key={invite.code} className="hover:bg-base-300 even:bg-base-200">
                              <td className="font-mono">{invite.code}</td>
                              <td>{invite.createdBy}</td>
                              <td>{new Date(invite.createdAt).toLocaleString()}</td>
                              <td className="flex gap-2">
                                 <button onClick={() => deleteInvite(invite.code)} className="btn btn-error btn-sm">
                                    Delete
                                 </button>
                                 <button onClick={() => setSelectedInvite(invite)} className="btn btn-primary btn-sm">
                                    Assign
                                 </button>
                              </td>
                           </tr>
                        ))}
                        {invites.length === 0 && (
                           <tr>
                              <td colSpan={4} className="text-center py-4">
                                 No invite codes found
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>

               {/* Pagination */}
               {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                     <button
                        className="btn btn-sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                     >
                        Previous
                     </button>
                     <span className="flex items-center px-4">
                        Page {currentPage} of {pagination.totalPages}
                     </span>
                     <button
                        className="btn btn-sm"
                        onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={currentPage === pagination.totalPages}
                     >
                        Next
                     </button>
                  </div>
               )}
            </div>
         </main>

         {/* Assign Invite Modal */}
         {selectedInvite && (
            <div className="modal modal-open">
               <div className="modal-box">
                  <h3 className="font-bold text-lg mb-4">Assign Invite to User</h3>
                  <div className="form-control">
                     <label className="label">
                        <span className="label-text">Username</span>
                     </label>
                     <input
                        type="text"
                        placeholder="Enter username"
                        className="input input-bordered"
                        value={assignUsername}
                        onChange={(e) => setAssignUsername(e.target.value)}
                     />
                  </div>
                  <div className="modal-action">
                     <button className="btn" onClick={() => setSelectedInvite(null)}>
                        Cancel
                     </button>
                     <button className="btn btn-primary" onClick={assignInvite}>
                        Assign
                     </button>
                  </div>
               </div>
            </div>
         )}
      </>
   )
}
