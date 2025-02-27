import { Router } from "express"
import { connection, users } from "../database"
import { eq } from "drizzle-orm"

const router = Router()

/*
get /user/:id - fetch user by id
?? get /user/:username - get user by username
post /user?username=X&password=X - create user
patch /user/:id?username=X&password=X - update user
delete /user/:id - delete user
*/

router.get('/:id', async (req, res) => {
  const userId = req.params.id
  const db = await connection()
  const user = await db.select().from(users).where(eq(users.id, userId))

  

  console.log("user response:", user)
})

//router.get('/:username', async (req, res) => { })

router.post("/", async (req, res) => { })

router.patch("/:id", async (req, res) => { })

router.delete("/:id", async (req, res) => { })

export default router
