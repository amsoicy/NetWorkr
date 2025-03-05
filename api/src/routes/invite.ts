import { Router, Request } from "express"
import { connection, invites, users } from "../database"
import { and, eq } from "drizzle-orm"
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

// Get all invites (admin only)
router.get("/", authenticateToken, async (req, res) => {
   const userid = req.user.id

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

   // Fetch all invites
   const allInvites = await db
      .select({
         code: invites.code,
         createdBy: invites.createdBy
      })
      .from(invites)

   res.status(HC.SUCCESS).json({
      success: true,
      invites: allInvites
   })
})

export default router
