import cors from "cors"
import express from "express"
import bodyParser from "body-parser"
import userRoute from "./routes/user"
import entityRoute from "./routes/entity"

const app = express()

app.use(bodyParser.json())
// Implement CORS
app.use('/entity', entityRoute)
app.use('/user', userRoute)

app.listen(3001, () => console.log("API running on localhost:3001"))
