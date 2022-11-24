import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import RouteError from "@src/declarations/classes";
import UserRepository from "@src/repos/UserRepository";
import * as bcrypt from "bcrypt";
import { tick } from "@src/declarations/functions";
import { JwtPayload } from "jsonwebtoken";
import jwtUtil from "./jwt-util";

// **** Types **** //

export interface ISessionUser extends JwtPayload {
  id: number;
  email: string;
}

// **** Variables **** //

// Errors
export const errors = {
  unauth: "Unauthorized",
  emailNotFound: (email: string) => `User with email "${email}" not found`
} as const;

// **** Functions **** //

/**
 * Login a user.
 */
async function getJwt(email: string, password: string): Promise<string> {
  // Fetch user
  const userRepository = new UserRepository();
  const user = await userRepository.getByEmail(email);
  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "User cannot be found");
  }
  if (!user) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      errors.emailNotFound(email)
    );
  }
  // Check password
  const checkPass = await bcrypt.compare(password, user.password);
  if (!checkPass) {
    // If password failed, wait 500ms this will increase security
    await tick(500);
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, errors.unauth);
  }
  // Setup Admin Cookie
  return jwtUtil.sign({
    id: user.id,
    email: user.name
  });
}

export default {
  getJwt
} as const;
