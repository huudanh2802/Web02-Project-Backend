/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-return-await */
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import UserService from "@src/services/UserService";
import { Router } from "express";
import { autoInjectable } from "tsyringe";
import jwt from "jsonwebtoken";
import EnvVars from "@src/declarations/major/EnvVars";

@autoInjectable()
export default class IndexController {
  private router: Router;

  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
    this.router = Router();
  }

  routes() {
    this.router.post(
      "/refresh",
      async (_req, res) => await this.refreshToken(_req, res)
    );
    return this.router;
  }

  async refreshToken(_req: any, res: any) {
    const sessionId = _req.body;
    const account = await this.userService.getUser(sessionId);
    const { id } = account;
    const token = jwt.sign({ id }, EnvVars.jwt.secret, { expiresIn: "1d" });

    return res
      .status(HttpStatusCodes.OK)
      .json({ token, id: account.id, email: account.email })
      .end();
  }
}
