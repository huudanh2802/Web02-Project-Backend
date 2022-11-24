/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { LoginDTO } from "@src/domains/dtos/LoginDTO";
import { IUser } from "@src/domains/models/User";
import UserService from "@src/services/UserService";
import { Router } from "express";

import { autoInjectable } from "tsyringe";
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import { IReq, IRes } from "@src/domains/entities/types";
import EnvVars from "@src/declarations/major/EnvVars";
import passport from "passport";
import auth from "@src/utils/auth";

@autoInjectable()
export default class UserController {
  private router: Router;

  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
    this.router = Router();
  }

  getUsers(): Promise<IUser[]> {
    return this.userService.getUsers();
  }

  async login(_req: any, _res: IRes) {
    const login: LoginDTO = _req.body;
    const jwt = await auth.getJwt(login.email, login.password);
    const { key, options } = EnvVars.cookieProps;
    _res.cookie(key, jwt, options);
    return _res.status(HttpStatusCodes.OK).end();
  }

  routes() {
    this.router.get("/get", async (_req, res) =>
      res.send(await this.getUsers())
    );
    this.router.post(
      "/login",
      // eslint-disable-next-line no-return-await
      async (_req, res) => await this.login(_req, res)
    );
    return this.router;
  }
}
