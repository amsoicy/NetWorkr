import { Router } from "express"
import { connection } from "../database"

const router = Router()

/*
get /identity/:id - fetch identity
post /identity?name=X&description=X - create identity

get /identity/relationship?idOne=X&idTwo=X - fetch relationship
get /identity/relationship?id=X - fetch relationship (via relationshipId)
post /identity/relationship?idOne=X&idTwo=X&name=X&note=X - create relationship
patch /identity/reationship?idOne=X&idTwo=X&name=X&note=X - update/modify relationship
delete /identity/relationship?idOne=X&idTwo=X - delete relationship
*/

router.get('/:id', async (req, res) => {
  const id = req.params.id
  const database = await connection()
  // const result = await database.f
})

export default router
