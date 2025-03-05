import JWT, { JwtPayload, VerifyErrors } from "jsonwebtoken"
import keys from "./keys"
import { CorsOptions } from "cors"
import { Request, Response, NextFunction } from "express"
import { connection, users } from "./database"
import { eq } from "drizzle-orm"

// Extend Express Request type to include user
declare global {
   namespace Express {
      interface Request {
         user: AuthToken
      }
   }
}

export const CORS: CorsOptions = {
   origin: "http://localhost:3000", // Frontend URL
   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
   allowedHeaders: ["Content-Type", "Authorization"],
   credentials: true
}

export interface AuthToken {
   id: string
   username: string
   permissions: number
}

export const HTTPCodes = {
   SUCCESS: 200,
   BAD_REQUEST: 400,
   UNAUTHORIZED: 401,
   FORBIDDEN: 403,
   NOT_FOUND: 404,
   SERVER_ERROR: 500
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const token = req.headers.authorization?.split(" ")[1]
      if (!token) {
         res.status(HTTPCodes.UNAUTHORIZED).json({
            success: false,
            error: "No token provided"
         })
         return
      }

      const decoded = JWT.verify(token, process.env.JWT_SECRET!) as AuthToken
      const db = await connection()

      // Check if user exists and is not banned
      const user = await db.select().from(users).where(eq(users.id, decoded.id))
      if (user.length === 0) {
         res.status(HTTPCodes.UNAUTHORIZED).json({
            success: false,
            error: "User not found"
         })
         return
      }

      // Check if user is banned
      if (user[0].banned) {
         res.status(HTTPCodes.FORBIDDEN).json({
            success: false,
            error: "Account is banned"
         })
         return
      }

      // Set user data without banned status
      req.user = decoded
      next()
   } catch (error) {
      res.status(HTTPCodes.UNAUTHORIZED).json({
         success: false,
         error: "Invalid token"
      })
   }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
   if (!req.user || req.user.permissions !== 1) {
      res.status(HTTPCodes.FORBIDDEN).json({
         success: false,
         error: "Admin access required"
      })
      return
   }
   next()
}
