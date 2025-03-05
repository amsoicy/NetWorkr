import { useState, useEffect } from "react"
import AdminHeader from "@/components/adminHeader"
import { useAuth } from "@/hooks/useAuth"

interface User {
   id: string
   username: string
   permissions: number
   invitedBy: string
   createdAt: string
   banned: boolean
}

interface Invite {
   code: string
   createdAt: string
}

interface Pagination {
   total: number
   page: number
   limit: number
   totalPages: number
}

export default function AdminUsersPage() {
   const { user, loading } = useAuth(true) // Require admin access
   const [users, setUsers] = useState<User[]>([])
   const [error, setError] = useState("")
   const [successMessage, setSuccessMessage] = useState("")
   const [currentPage, setCurrentPage] = useState(1)
   const [pagination, setPagination] = useState<Pagination | null>(null)
   const [searchTerm, setSearchTerm] = useState("")
   const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all")
   const [selectedUser, setSelectedUser] = useState<User | null>(null)
   const [userInvites, setUserInvites] = useState<Invite[]>([])
   const [loadingInvites, setLoadingInvites] = useState(false)
   const [invitesCurrentPage, setInvitesCurrentPage] = useState(1)
   const INVITES_PER_PAGE = 5

   useEffect(() => {
      if (user) {
         fetchUsers()
      }
   }, [user, currentPage, searchTerm, roleFilter])

   useEffect(() => {
      if (selectedUser) {
         fetchUserInvites()
      }
   }, [selectedUser])

   const fetchUsers = async () => {
      try {
         const token = localStorage.getItem("token")
         const response = await fetch(
            `http://localhost:3001/user?page=${currentPage}&limit=10&search=${searchTerm}&role=${roleFilter}`,
            {
               headers: {
                  Authorization: `Bearer ${token}`
               }
            }
         )
         const data = await response.json()
         console.log("API Response:", data) // Debug log

         if (data.success) {
            setUsers(data.users || [])
            setPagination(data.pagination)
         } else {
            setError(data.error || "Failed to fetch users")
         }
      } catch (err) {
         console.error("Error fetching users:", err)
         setError("Failed to connect to server")
      }
   }

   const fetchUserInvites = async () => {
      if (!selectedUser) return

      setLoadingInvites(true)
      try {
         const token = localStorage.getItem("token")
         const response = await fetch(`http://localhost:3001/user/${selectedUser.id}/invites`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = await response.json()

         if (data.success) {
            setUserInvites(data.invites)
         } else {
            setError(data.error || "Failed to fetch user invites")
         }
      } catch (err) {
         console.error("Error fetching user invites:", err)
         setError("Failed to connect to server")
      } finally {
         setLoadingInvites(false)
      }
   }

   const deleteInvite = async (code: string) => {
      if (!selectedUser) return

      try {
         const token = localStorage.getItem("token")
         const response = await fetch(`http://localhost:3001/user/${selectedUser.id}/invites/${code}`, {
            method: "DELETE",
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = await response.json()

         if (data.success) {
            fetchUserInvites() // Refresh the invites list
         } else {
            setError(data.error || "Failed to delete invite")
         }
      } catch (err) {
         console.error("Error deleting invite:", err)
         setError("Failed to connect to server")
      }
   }

   const banUser = async () => {
      if (!selectedUser) return

      try {
         const token = localStorage.getItem("token")
         const endpoint = selectedUser.banned ? "unban" : "ban"
         const response = await fetch(`http://localhost:3001/user/${selectedUser.id}/${endpoint}`, {
            method: "POST",
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = await response.json()

         if (data.success) {
            setSuccessMessage(
               data.message ||
                  `User ${selectedUser.username} has been ${selectedUser.banned ? "unbanned" : "banned"} successfully`
            )
            setSelectedUser(null)
            fetchUsers() // Refresh the users list
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(""), 3000)
         } else {
            setError(data.error || "Failed to ban user")
         }
      } catch (err) {
         console.error("Error banning user:", err)
         setError("Failed to connect to server")
      }
   }

   // Calculate pagination for invites
   const totalInvites = userInvites.length
   const totalInvitePages = Math.ceil(totalInvites / INVITES_PER_PAGE)
   const startIndex = (invitesCurrentPage - 1) * INVITES_PER_PAGE
   const endIndex = Math.min(startIndex + INVITES_PER_PAGE, totalInvites)
   const paginatedInvites = userInvites.slice(startIndex, endIndex)

   if (loading) {
      return (
         <>
            <AdminHeader />
            <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] flex items-center justify-center">
               <div className="text-2xl font-semibold">Loading...</div>
            </main>
         </>
      )
   }

   return (
      <>
         <AdminHeader />
         <title>Identity Tracker | Admin - Users</title>

         <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">User management</h1>

            {error && (
               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
            )}
            {successMessage && (
               <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {successMessage}
               </div>
            )}

            {/* Filters */}
            <div className="bg-base-200 rounded-lg p-6 mb-8">
               <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                     <input
                        type="text"
                        placeholder="Search users..."
                        className="input input-bordered w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
                  <div className="flex gap-2">
                     <select
                        className="select select-bordered"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "user")}
                     >
                        <option value="all">All roles</option>
                        <option value="admin">Admins only</option>
                        <option value="user">Users only</option>
                     </select>
                  </div>
               </div>
            </div>

            {/* Users Table */}
            <div className="bg-base-200 rounded-lg p-6">
               <div className="overflow-x-auto">
                  <table className="table w-full">
                     <thead>
                        <tr>
                           <th className="border-b border-base-300">Username</th>
                           <th className="border-b border-base-300">Role</th>
                           <th className="border-b border-base-300">Status</th>
                           <th className="border-b border-base-300">Invited by</th>
                           <th className="border-b border-base-300">Registration date</th>
                        </tr>
                     </thead>
                     <tbody>
                        {users.map((user) => (
                           <tr
                              key={user.id}
                              className="hover:bg-base-300 even:bg-base-200 cursor-pointer"
                              onClick={() => setSelectedUser(user)}
                           >
                              <td>{user.username}</td>
                              <td>{user.permissions === 1 ? "admin" : "user"}</td>
                              <td>
                                 <span className={`badge ${user.banned ? "badge-error" : "badge-success"}`}>
                                    {user.banned ? "Banned" : "Active"}
                                 </span>
                              </td>
                              <td>{user.invitedBy || "N/A"}</td>
                              <td>{new Date(user.createdAt).toLocaleString()}</td>
                           </tr>
                        ))}
                        {users.length === 0 && (
                           <tr>
                              <td colSpan={5} className="text-center py-4">
                                 No users found
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

         {/* User Details Modal */}
         {selectedUser && (
            <div className="modal modal-open">
               <div className="modal-box max-w-2xl">
                  <h3 className="font-bold text-lg mb-4">User Details</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div>
                        <p className="text-sm text-base-content/70">Username</p>
                        <p className="font-medium">{selectedUser.username}</p>
                     </div>
                     <div>
                        <p className="text-sm text-base-content/70">Role</p>
                        <p className="font-medium">{selectedUser.permissions === 1 ? "Admin" : "User"}</p>
                     </div>
                     <div>
                        <p className="text-sm text-base-content/70">Status</p>
                        <p className="font-medium">
                           <span className={`badge ${selectedUser.banned ? "badge-error" : "badge-success"}`}>
                              {selectedUser.banned ? "Banned" : "Active"}
                           </span>
                        </p>
                     </div>
                     <div>
                        <p className="text-sm text-base-content/70">Invited by</p>
                        <p className="font-medium">{selectedUser.invitedBy || "N/A"}</p>
                     </div>
                     <div>
                        <p className="text-sm text-base-content/70">Registration date</p>
                        <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                     </div>
                  </div>

                  <h4 className="font-bold text-lg mb-4">User&apos;s Invites</h4>
                  {loadingInvites ? (
                     <div className="text-center py-4">Loading invites...</div>
                  ) : userInvites.length > 0 ? (
                     <>
                        <div className="overflow-x-auto">
                           <table className="table w-full">
                              <thead>
                                 <tr>
                                    <th className="border-b border-base-300">Invite Code</th>
                                    <th className="border-b border-base-300">Created At</th>
                                    <th className="border-b border-base-300">Actions</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {paginatedInvites.map((invite) => (
                                    <tr key={invite.code} className="hover:bg-base-300 even:bg-base-200">
                                       <td className="font-mono">{invite.code}</td>
                                       <td>{new Date(invite.createdAt).toLocaleString()}</td>
                                       <td>
                                          <button
                                             className="btn btn-error btn-sm"
                                             onClick={() => deleteInvite(invite.code)}
                                          >
                                             Delete
                                          </button>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                        {totalInvitePages > 1 && (
                           <div className="flex justify-center gap-2 mt-4">
                              <button
                                 className="btn btn-sm"
                                 onClick={() => setInvitesCurrentPage((p) => Math.max(1, p - 1))}
                                 disabled={invitesCurrentPage === 1}
                              >
                                 Previous
                              </button>
                              <span className="flex items-center px-4">
                                 Page {invitesCurrentPage} of {totalInvitePages}
                              </span>
                              <button
                                 className="btn btn-sm"
                                 onClick={() => setInvitesCurrentPage((p) => Math.min(totalInvitePages, p + 1))}
                                 disabled={invitesCurrentPage === totalInvitePages}
                              >
                                 Next
                              </button>
                           </div>
                        )}
                     </>
                  ) : (
                     <div className="text-center py-4">No invites found</div>
                  )}

                  <div className="modal-action">
                     <button
                        className={`btn ${selectedUser.banned ? "btn-success" : "btn-error"}`}
                        onClick={banUser}
                        disabled={selectedUser.permissions === 1}
                     >
                        {selectedUser.banned ? "Unban User" : "Ban User"}
                     </button>
                     <button className="btn" onClick={() => setSelectedUser(null)}>
                        Close
                     </button>
                  </div>
               </div>
            </div>
         )}
      </>
   )
}
