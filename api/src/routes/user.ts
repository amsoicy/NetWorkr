import bcrypt from "bcrypt"
import JWT from "jsonwebtoken"
import { Router, Request, Response, RequestHandler } from "express"
import { eq, and, desc, sql } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import { authenticateToken, AuthToken, HTTPCodes as HC } from "../util"
import { connection, invites, users } from "../database"
import keys from "../keys"
import jwt from "jsonwebtoken"

const router = Router()

// Get all users (admin only)
const getAllUsers: RequestHandler = async (req, res) => {
   try {
      const token = req.headers.authorization?.split(" ")[1]
      if (!token) {
         res.status(401).json({ success: false, error: "No token provided" })
         return
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
      const db = await connection()

      const user = await db.select().from(users).where(eq(users.id, decoded.id))

      if (user.length === 0) {
         res.status(404).json({ success: false, error: "User not found" })
         return
      }

      if (user[0].permissions !== 1) {
         res.status(403).json({ success: false, error: "Not authorized" })
         return
      }

      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const search = (req.query.search as string) || ""
      const role = (req.query.role as string) || "all"
      const offset = (page - 1) * limit

      // Build the query conditions
      const conditions = []
      if (search) {
         conditions.push(sql`username LIKE ${`%${search}%`}`)
      }
      if (role === "admin") {
         conditions.push(eq(users.permissions, 1))
      } else if (role === "user") {
         conditions.push(eq(users.permissions, 0))
      }

      // Get total count for pagination
      const totalCount = await db
         .select({ count: sql<number>`count(*)` })
         .from(users)
         .where(conditions.length > 0 ? and(...conditions) : undefined)
      const total = totalCount[0].count
      const totalPages = Math.ceil(total / limit)

      // Get paginated users
      const usersResult = await db
         .select({
            id: users.id,
            username: users.username,
            permissions: users.permissions,
            invitedBy: users.invitedBy,
            createdAt: users.createdAt,
            banned: users.banned
         })
         .from(users)
         .where(conditions.length > 0 ? and(...conditions) : undefined)
         .orderBy(desc(users.createdAt))
         .limit(limit)
         .offset(offset)

      // Get inviter usernames
      const inviterIds = usersResult.map((user) => user.invitedBy).filter((id): id is string => id !== null)
      const inviters =
         inviterIds.length > 0
            ? await db
                 .select({
                    id: users.id,
                    username: users.username
                 })
                 .from(users)
                 .where(eq(users.id, inviterIds[0]))
            : []

      // Create a map of inviter IDs to usernames
      const inviterMap = new Map(inviters.map((inviter) => [inviter.id, inviter.username]))

      // Replace inviter IDs with usernames
      const usersWithInviterNames = usersResult.map((user) => ({
         ...user,
         invitedBy: user.invitedBy ? inviterMap.get(user.invitedBy) || "Unknown" : null
      }))

      res.json({
         success: true,
         users: usersWithInviterNames,
         pagination: {
            total,
            page,
            limit,
            totalPages
         }
      })
   } catch (error) {
      console.error("Error fetching users:", error)
      res.status(500).json({ success: false, error: "Internal server error" })
   }
}

router.get("/", getAllUsers)

// Check if user is admin
router.get("/isAdmin", authenticateToken, async (req, res) => {
   const userId = req.user.id

   const db = await connection()
   const user = await db.select().from(users).where(eq(users.id, userId))

   if (user.length === 0) {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "User not found"
      })
      return
   }

   res.status(HC.SUCCESS).json({
      success: true,
      user: {
         id: user[0].id,
         username: user[0].username,
         permissions: user[0].permissions,
         banned: user[0].banned
      }
   })
})

// Get latest 10 users (admin only)
router.get("/latest", authenticateToken, async (req, res) => {
   const userid = req.user.id
   const db = await connection()

   // Check if user has admin permissions
   const adminUser = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userid), eq(users.permissions, 1)))

   if (adminUser.length === 0) {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "User has insufficient permissions"
      })
      return
   }

   // Fetch latest 10 users with inviter usernames
   const latestUsers = await db
      .select({
         id: users.id,
         username: users.username,
         permissions: users.permissions,
         invitedBy: users.invitedBy,
         createdAt: users.createdAt,
         banned: users.banned
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10)

   // Get inviter usernames
   const inviterIds = latestUsers.map((user) => user.invitedBy).filter((id): id is string => id !== null)
   const inviters =
      inviterIds.length > 0
         ? await db
              .select({
                 id: users.id,
                 username: users.username
              })
              .from(users)
              .where(eq(users.id, inviterIds[0]))
         : []

   // Create a map of inviter IDs to usernames
   const inviterMap = new Map(inviters.map((inviter) => [inviter.id, inviter.username]))

   // Replace inviter IDs with usernames
   const usersWithInviterNames = latestUsers.map((user) => ({
      ...user,
      invitedBy: user.invitedBy ? inviterMap.get(user.invitedBy) || "Unknown" : null
   }))

   res.status(HC.SUCCESS).json({
      success: true,
      users: usersWithInviterNames
   })
})

// fetch user data
router.get("/:id", async (req, res) => {
   const userId = req.params.id
   const db = await connection()
   const user = await db.select().from(users).where(eq(users.id, userId))

   if (user.length == 0) {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "User does not exist"
      })
      return
   }

   res.status(200).json({
      success: true,
      user: {
         id: user[0].id,
         username: user[0].username,
         invitedBy: user[0].invitedBy,
         permissions: user[0].permissions,
         createdAt: user[0].createdAt,
         banned: user[0].banned
      }
   })
})

// login
router.post("/login", async (req, res) => {
   const username = req.body?.username
   const password = req.body?.password

   console.log(`user: ${username}, password: ${password}`)

   if (typeof username !== "string" || typeof password !== "string") {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "Missing request parameters (username or password)"
      })
      return
   }

   const db = await connection()
   const user = await db.select().from(users).where(eq(users.username, username))

   if (user.length == 0) {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "Invalid username or password"
      })
      return
   }

   const verified = await bcrypt.compare(password, user[0].password)

   if (!verified) {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "Invalid username or password"
      })
      return
   }

   const token: AuthToken = {
      id: user[0].id,
      username,
      permissions: user[0].permissions
   }

   JWT.sign(token, keys.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err) {
         res.status(HC.SERVER_ERROR).json({
            success: false,
            error: "Failed to generate JWT"
         })
         return
      }

      res.status(200).json({
         success: true,
         token
      })
   })
})

// register
router.post("/", async (req, res) => {
   const username = req.body?.username
   const password = req.body?.password
   const code = req.body?.code?.trim()

   if (typeof username !== "string" || typeof password !== "string" || typeof code !== "string") {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "Missing request parameters (username, password, or invite code)"
      })
      return
   }

   // TODO: Decide if this is necessary
   // if (code.length != 36) {
   //    res.status(HC.BAD_REQUEST).json({
   //       success: false,
   //       error: "Missing request parameters (username, password, or registration code)"
   //    })
   //    return
   // }

   const db = await connection()
   const invite = await db.select().from(invites).where(eq(invites.code, code))

   if (invite.length == 0) {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "Invalid registration code provided"
      })
      return
   }

   const existingUser = await db.select().from(users).where(eq(users.username, username))

   if (existingUser.length != 0) {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "Username already in use"
      })
      return
   }

   const id = uuidv4()
   const hashedPassword = await bcrypt.hash(password, 10)
   await db.insert(users).values({
      id,
      username,
      password: hashedPassword,
      invitedBy: invite[0].createdBy
   })

   await db.delete(invites).where(eq(invites.code, code))

   const token: AuthToken = {
      id,
      username,
      permissions: 0
   }

   JWT.sign(token, keys.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err) {
         res.status(HC.SERVER_ERROR).json({
            success: false,
            error: "Failed to generate JWT"
         })
         return
      }

      res.status(200).json({
         success: true,
         token
      })
   })
})

// update user data
router.patch("/:id", authenticateToken, async (req, res) => {})

// delete user
router.delete("/:id", authenticateToken, async (req, res) => {
   try {
      const token = req.headers.authorization?.split(" ")[1]
      if (!token) {
         res.status(401).json({ success: false, error: "No token provided" })
         return
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
      const db = await connection()

      // Check if requesting user is admin
      const adminUser = await db.select().from(users).where(eq(users.id, decoded.id))
      if (adminUser.length === 0 || adminUser[0].permissions !== 1) {
         res.status(403).json({ success: false, error: "Not authorized" })
         return
      }

      const userId = req.params.id

      // Delete user's invites first
      await db.delete(invites).where(eq(invites.createdBy, userId))

      // Then delete the user
      await db.delete(users).where(eq(users.id, userId))

      res.json({
         success: true
      })
   } catch (error) {
      console.error("Error deleting user:", error)
      res.status(500).json({ success: false, error: "Internal server error" })
   }
})

// Get user's own invite codes
router.get("/invites", authenticateToken, async (req, res) => {
   const userid = req.user.id
   const page = parseInt(req.query.page as string) || 1
   const limit = parseInt(req.query.limit as string) || 10
   const offset = (page - 1) * limit

   const db = await connection()

   // Get total count of user's invites
   const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(invites)
      .where(eq(invites.createdBy, userid))
   const total = totalCount[0].count

   // Fetch all user's invite codes
   const userInvites = await db
      .select({
         code: invites.code,
         createdAt: invites.createdAt
      })
      .from(invites)
      .where(eq(invites.createdBy, userid))
      .orderBy(desc(invites.createdAt))

   // Calculate pagination info
   const totalPages = Math.ceil(total / limit)
   const currentPage = Math.min(Math.max(1, page), totalPages)
   const startIndex = (currentPage - 1) * limit
   const endIndex = Math.min(startIndex + limit, total)
   const paginatedInvites = userInvites.slice(startIndex, endIndex)

   res.status(HC.SUCCESS).json({
      success: true,
      invites: paginatedInvites,
      pagination: {
         total,
         page: currentPage,
         limit,
         totalPages
      }
   })
})

// Get user's invites (admin only)
router.get("/:id/invites", authenticateToken, async (req, res) => {
   try {
      const token = req.headers.authorization?.split(" ")[1]
      if (!token) {
         res.status(401).json({ success: false, error: "No token provided" })
         return
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
      const db = await connection()

      // Check if requesting user is admin
      const adminUser = await db.select().from(users).where(eq(users.id, decoded.id))
      if (adminUser.length === 0 || adminUser[0].permissions !== 1) {
         res.status(403).json({ success: false, error: "Not authorized" })
         return
      }

      const userId = req.params.id
      const userInvites = await db
         .select({
            code: invites.code,
            createdAt: invites.createdAt
         })
         .from(invites)
         .where(eq(invites.createdBy, userId))
         .orderBy(desc(invites.createdAt))

      res.json({
         success: true,
         invites: userInvites
      })
   } catch (error) {
      console.error("Error fetching user invites:", error)
      res.status(500).json({ success: false, error: "Internal server error" })
   }
})

// ban/unban user
router.post("/:id/ban", authenticateToken, async (req, res) => {
   try {
      const token = req.headers.authorization?.split(" ")[1]
      if (!token) {
         res.status(401).json({ success: false, error: "No token provided" })
         return
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
      const db = await connection()

      // Check if requesting user is admin
      const adminUser = await db.select().from(users).where(eq(users.id, decoded.id))
      if (adminUser.length === 0 || adminUser[0].permissions !== 1) {
         res.status(403).json({ success: false, error: "Not authorized" })
         return
      }

      const userId = req.params.id
      const user = await db.select().from(users).where(eq(users.id, userId))

      if (user.length === 0) {
         res.status(404).json({ success: false, error: "User not found" })
         return
      }

      // Check if user is already banned
      if (user[0].banned) {
         res.status(400).json({ success: false, error: "User is already banned" })
         return
      }

      // Ban the user
      await db.update(users).set({ banned: true }).where(eq(users.id, userId))

      res.json({
         success: true,
         message: "User has been banned successfully"
      })
   } catch (error) {
      console.error("Error banning user:", error)
      res.status(500).json({ success: false, error: "Internal server error" })
   }
})

// Unban user
router.post("/:id/unban", authenticateToken, async (req, res) => {
   try {
      const token = req.headers.authorization?.split(" ")[1]
      if (!token) {
         res.status(401).json({ success: false, error: "No token provided" })
         return
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
      const db = await connection()

      // Check if requesting user is admin
      const adminUser = await db.select().from(users).where(eq(users.id, decoded.id))
      if (adminUser.length === 0 || adminUser[0].permissions !== 1) {
         res.status(403).json({ success: false, error: "Not authorized" })
         return
      }

      const userId = req.params.id
      const user = await db.select().from(users).where(eq(users.id, userId))

      if (user.length === 0) {
         res.status(404).json({ success: false, error: "User not found" })
         return
      }

      // Check if user is already unbanned
      if (!user[0].banned) {
         res.status(400).json({ success: false, error: "User is not banned" })
         return
      }

      // Unban the user
      await db.update(users).set({ banned: false }).where(eq(users.id, userId))

      res.json({
         success: true,
         message: "User has been unbanned successfully"
      })
   } catch (error) {
      console.error("Error unbanning user:", error)
      res.status(500).json({ success: false, error: "Internal server error" })
   }
})

// Delete invite (admin only)
router.delete("/:userId/invites/:code", authenticateToken, async (req, res) => {
   try {
      const token = req.headers.authorization?.split(" ")[1]
      if (!token) {
         res.status(401).json({ success: false, error: "No token provided" })
         return
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
      const db = await connection()

      // Check if requesting user is admin
      const adminUser = await db.select().from(users).where(eq(users.id, decoded.id))
      if (adminUser.length === 0 || adminUser[0].permissions !== 1) {
         res.status(403).json({ success: false, error: "Not authorized" })
         return
      }

      const { userId, code } = req.params
      await db.delete(invites).where(and(eq(invites.createdBy, userId), eq(invites.code, code)))

      res.json({
         success: true
      })
   } catch (error) {
      console.error("Error deleting invite:", error)
      res.status(500).json({ success: false, error: "Internal server error" })
   }
})

export default router
