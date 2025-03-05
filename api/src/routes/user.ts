import bcrypt from "bcrypt"
import JWT from "jsonwebtoken"
import { Router } from "express"
import { eq } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import { authenticateToken, AuthToken, HTTPCodes as HC } from "../util"
import { connection, invites, users } from "../database"
import keys from "../keys"

const router = Router()

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
         permissions: user[0].permissions
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
   const code = req.body?.code

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
router.delete("/:id", authenticateToken, async (req, res) => {})

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
      isAdmin: user[0].permissions === 1
   })
})

export default router
