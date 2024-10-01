import { JWTPayload } from "express-oauth2-jwt-bearer"

export {}

declare global {
  interface Request {
    userId: string
  }
  // Express
  namespace Express {
    interface Request {
      user: string | JWTPayload
    }
  }
}
