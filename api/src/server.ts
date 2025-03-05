import cors from "cors"
import { CORS } from "./util"
import express from "express"
import bodyParser from "body-parser"
import userRoute from "./routes/user"
import entityRoute from "./routes/entity"
import inviteRoute from "./routes/invite"

declare global {
   namespace Express {
      interface Request {
         user: {
            id: string
            username: string
            permissions: number
         }
      }
   }
}

const app = express()

app.use(cors(CORS))
app.use(bodyParser.json())

app.use("/user", userRoute)
app.use("/entity", entityRoute)
app.use("/invite", inviteRoute)

app.listen(3001, () => console.log("API running on localhost:3001"))
   