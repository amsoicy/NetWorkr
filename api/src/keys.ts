import { config } from "dotenv"
import { resolve } from "path"

const dir = resolve(__dirname, "..", "..", ".env")

config({ path: dir })

interface Keys {
   MYSQL_HOST: string
   MYSQL_USER: string
   MYSQL_PASS: string
   MYSQL_DB: string
   JWT_SECRET: string
}

const keys: Keys = {
   MYSQL_HOST: process.env.MYSQL_HOST ?? "nil",
   MYSQL_USER: process.env.MYSQL_USER ?? "nil",
   MYSQL_PASS: process.env.MYSQL_PASS ?? "nil",
   MYSQL_DB: process.env.MYSQL_DB ?? "nil",
   JWT_SECRET: process.env.JWT_SECRET ?? "nil"
}

if (Object.values(keys).includes("nil")) throw new Error("Missing ENV variables (check keys.ts for all keys)")

export default keys
