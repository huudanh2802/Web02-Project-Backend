/* eslint-disable no-return-await */
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
import SignupDTO from "@src/domains/dtos/SignUpDTO";

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

  async signup(_req: any, _res: IRes) {
    const signup: SignupDTO = _req.body;
    await this.userService.signup(signup);
    return _res.status(HttpStatusCodes.OK).end();
  }

  async activeAccount(_req: any, _res: IRes) {
    const { emailToken } = _req.params;
    await this.userService.activeAccount(emailToken);
    return _res.status(HttpStatusCodes.OK).end();
  }

  routes() {
    this.router.get("/get", async (_req, res) =>
      res.send(await this.getUsers())
    );
    this.router.post(
      "/login",
      async (_req, res) => await this.login(_req, res)
    );
    this.router.post(
      "/signup",
      async (_req, res) => await this.signup(_req, res)
    );
    this.router.get(
      "/verify/:emailToken",
      async (_req, res) => await this.activeAccount(_req, res)
    );
    return this.router;
  }
}
