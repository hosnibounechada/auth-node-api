import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../types";

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const decodeRefreshToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.cookies?.jwt) return next();
  try {
    const payload = jwt.verify(req.cookies.jwt, process.env.REFRESH_TOKEN_KEY!) as UserPayload;
    req.currentUser = payload;
  } catch (err) {}

  next();
};
