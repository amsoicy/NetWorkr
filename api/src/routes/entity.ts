import { Router } from "express"
import { connection } from "../database"

const router = Router()

/*
get /entity/:id - fetch entity
post /entity?name=X&description=X - create entity

get /entity/relationship?idOne=X&idTwo=X - fetch relationship
get /entity/relationship?id=X - fetch relationship (via relationshipId)
post /entity/relationship?idOne=X&idTwo=X&name=X&note=X - create relationship
patch /entity/reationship?idOne=X&idTwo=X&name=X&note=X - update/modify relationship
delete /entity/relationship?idOne=X&idTwo=X - delete relationship
*/

router.get('/:id', async (req, res) => {
  const id = req.params.id
  const database = await connection()
  // const result = await database.f
})

export default router
