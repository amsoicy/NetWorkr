import JWT from "jsonwebtoken"
import keys from "./keys"
import { NextFunction, Request, Response } from "express"
import { CorsOptions } from "cors"

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

// FIX: express functions error when req is set to Express.Request (wrong type mayb?)
export function authenticateToken(req: any, res: any, next: any) {
   const authHeader = req.headers["authorization"]
   const token = authHeader && authHeader.split(" ")[1]

   if (token == null) {
      res.status(HTTPCodes.BAD_REQUEST).json({
         success: false,
         error: "Missing request parameters (authorization)"
      })
      return
   }

   JWT.verify(token, keys.JWT_SECRET, (err: any, user: any) => {
      if (err) {
         console.log("jwt err:", err)
         res.status(HTTPCodes.FORBIDDEN).json({
            success: false,
            error: "User logon expired"
         })
         return
      }

      // TODO: should probably do a db check to make sure user still exists n stuff
      req.user = user
      next()
   })
}

export const HTTPCodes = {
   ["SUCCESS"]: 200,
   ["BAD_REQUEST"]: 400,
   ["UNAUTHORIZED"]: 401,
   ["FORBIDDEN"]: 403,
   ["NOT_FOUND"]: 404,
   ["SERVER_ERROR"]: 500
}
