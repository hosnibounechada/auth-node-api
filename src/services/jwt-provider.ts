import jwt from "jsonwebtoken";
import { UserPayload } from "../types";

export class JwtProvider {
  static jwtAuth(data: UserPayload) {
    return jwt.sign(data, process.env.JWT_KEY!, {
      expiresIn: Number(process.env.JWT_TTL) || 60 * 5,
    });
  }

  static async compare(storedPassword: string, suppliedPassword: string) {}
}
