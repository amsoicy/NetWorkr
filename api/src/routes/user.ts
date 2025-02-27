import { Router } from "express"
import { connection, invites, users } from "../database"
import { eq } from "drizzle-orm"
import { HTTPCodes as HC } from "../util"

const router = Router()

/*
get /user/:id - fetch user by id
?? get /user/:username - get user by username
post /user?username=X&password=X - create user
patch /user/:id?username=X&password=X - update user
delete /user/:id - delete user
*/

router.get("/:id", async (req, res) => {
   const userId = req.params.id
   const db = await connection()
   const user = await db.select().from(users).where(eq(users.id, userId))

   console.log("user response:", user)
})

router.post("/", async (req, res) => {
   const username = req.query?.username
   const password = req.query?.password
   const code = req.query?.code

   if (!username || !password || !code) {
      res.status(HC.BAD_REQUEST).json({
         success: false,
         error: "Missing request parameters (username, password, or invite code)"
      })
      return
   }

   if (code.length > 36) {
   }

   const db = await connection()
   const invite = await db.select().from(invites).where(eq(invites.code, code))
})

router.patch("/:id", async (req, res) => {})

router.delete("/:id", async (req, res) => {})

export default router
