import { Router, Request } from "express"
import { connection, invites, users } from "../database"
import { and, eq, sql, desc } from "drizzle-orm"
import { authenticateToken, HTTPCodes as HC } from "../util"
import { v4 as uuidv4 } from "uuid"

const router = Router()

router.post("/", authenticateToken, async (req, res) => {
   const userid = req.body?.userid

   if (typeof userid !== "string") {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "Missing request parameters (userid)"
      })
      return
   }

   const db = await connection()
   const user = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userid), eq(users.permissions, 1)))

   if (user.length == 0) {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "User has insufficient permissions"
      })
      return
   }

   while (true) {
      const code = uuidv4()
      const existingCode = await db.select().from(invites).where(eq(invites.code, code))

      if (existingCode.length != 0) {
         continue
      }

      const newInvite = await db.insert(invites).values({
         code,
         createdBy: userid
      })
      // TODO: ensure invite successfully created
      break
   }

   res.status(200).json({ success: true })
})

router.delete("/:id", authenticateToken, async (req, res) => {
   const inviteId = req.params.id
   const userid = req.user.id

   if (typeof userid !== "string") {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "User not authenticated"
      })
      return
   }

   const db = await connection()

   // Check if user has admin permissions
   const user = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userid), eq(users.permissions, 1)))

   if (user.length === 0) {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "User has insufficient permissions"
      })
      return
   }

   // Delete the invite
   const deletedInvite = await db.delete(invites).where(eq(invites.code, inviteId))

   res.status(HC.SUCCESS).json({ success: true })
})

router.get("/", authenticateToken, async (req, res) => {
   const userid = req.user.id
   const page = parseInt(req.query.page as string) || 1
   const limit = parseInt(req.query.limit as string) || 10
   const offset = (page - 1) * limit

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

   // Get total count
   const totalCount = await db.select({ count: sql<number>`count(*)` }).from(invites)
   const total = totalCount[0].count

   // Fetch paginated invites with owner usernames
   const allInvites = await db
      .select({
         code: invites.code,
         createdBy: invites.createdBy,
         ownerUsername: users.username,
         createdAt: invites.createdAt
      })
      .from(invites)
      .leftJoin(users, eq(invites.createdBy, users.id))
      .orderBy(desc(invites.createdAt))
      .limit(limit)
      .offset(offset)

   res.status(HC.SUCCESS).json({
      success: true,
      invites: allInvites.map((invite) => ({
         code: invite.code,
         createdBy: invite.ownerUsername || "N/A",
         createdAt: invite.createdAt
      })),
      pagination: {
         total,
         page,
         limit,
         totalPages: Math.ceil(total / limit)
      }
   })
})

// Assign invite to user
router.patch("/:code/assign", authenticateToken, async (req, res) => {
   const code = req.params.code
   const username = req.body?.username

   if (typeof username !== "string") {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "Missing username parameter"
      })
      return
   }

   const db = await connection()

   // Check if user exists
   const user = await db.select().from(users).where(eq(users.username, username))
   if (user.length === 0) {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "User not found"
      })
      return
   }

   // Update invite
   await db.update(invites).set({ createdBy: user[0].id }).where(eq(invites.code, code))

   res.status(HC.SUCCESS).json({
      success: true,
      message: "Invite assigned successfully"
   })
})

export default router
