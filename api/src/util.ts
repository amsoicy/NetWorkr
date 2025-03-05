import JWT, { JwtPayload, VerifyErrors } from "jsonwebtoken"
import keys from "./keys"
import { CorsOptions } from "cors"
import { Request, Response, NextFunction } from "express"

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

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
   const authHeader = req.headers["authorization"]
   const token = authHeader && authHeader.split(" ")[1]

   if (token == null) {
      res.status(HTTPCodes.BAD_REQUEST).json({
         success: false,
         error: "Missing request parameters (authorization)"
      })
      return
   }

   JWT.verify(token, keys.JWT_SECRET, (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
      if (err) {
         console.log("jwt err:", err)
         res.status(HTTPCodes.FORBIDDEN).json({
            success: false,
            error: "User logon expired"
         })
         return
      }

      // TODO: should probably do a db check to make sure user still exists n stuff
      req.user = decoded as AuthToken
      next()
   })
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

export const HTTPCodes = {
   ["SUCCESS"]: 200,
   ["BAD_REQUEST"]: 400,
   ["UNAUTHORIZED"]: 401,
   ["FORBIDDEN"]: 403,
   ["NOT_FOUND"]: 404,
   ["SERVER_ERROR"]: 500
}
