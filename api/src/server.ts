import cors from "cors"
import express from "express"
import bodyParser from "body-parser"
import identityRoute from "./routes/identity"
import userRoute from "./routes/user"

const app = express()

app.use(bodyParser.json())
// Implement CORS
app.use('/identity', identityRoute)
app.use('/user', userRoute)

app.listen(3001, () => console.log("API running on localhost:3001"))
