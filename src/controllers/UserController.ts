/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoginDTO } from "@src/domains/dtos/LoginDTO";
import { IUser } from "@src/domains/models/User";
import UserService from "@src/services/UserService";
import { Router } from "express";

import EnvVars from "@src/declarations/major/EnvVars";
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import { GoogleDTO } from "@src/domains/dtos/GoogleDTO";
import MemberOptionDTO from "@src/domains/dtos/MemberOptionDTO";
import { RenewPasswordDTO } from "@src/domains/dtos/RenewPasswordDTO";
import SignupDTO from "@src/domains/dtos/SignUpDTO";
import UpdatePasswordDTO from "@src/domains/dtos/UpdatePasswordDTO";
import { IRes } from "@src/domains/entities/types";
import jwt from "jsonwebtoken";
import passport from "passport";
import { autoInjectable } from "tsyringe";

@autoInjectable()
export default class UserController {
  private router: Router;

  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
    this.router = Router();
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
    this.router.post(
      "/googleAuthen",
      async (_req, res) => await this.googleAuthen(_req, res)
    );
    this.router.post(
      "/forget",
      async (_req, res) => await this.renewPassword(_req, res)
    );
    this.router.get(
      "/verify/:emailToken",
      async (_req, res) => await this.activeAccount(_req, res)
    );
    this.router.get(
      "/get/:id",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.getUser(_req, res)
    );
    this.router.get(
      "/memberselection/:id",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.getMemberSelection(_req, res)
    );
    this.router.put(
      "/update",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.updateUser(_req, res)
    );
    this.router.put(
      "/updatepassword",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.updatePassword(_req, res)
    );
    this.router.get(
      "/getMemberSearch/:id",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.getMemberSearch(_req, res)
    );
    return this.router;
  }

  async getMemberSearch(_req: any, res: any) {
    const { id } = _req.params;
    const result = await this.userService.getMember(id);
    const mapResult: MemberOptionDTO[] = result.map((u) => ({
      id: u.id.toString(),
      fullname: u.fullname,
      email: u.email
    }));
    res.header("Access-Control-Allow-Origin", "*");

    return res.status(HttpStatusCodes.OK).send(mapResult).end();
  }

  async updateUser(_req: any, res: any) {
    const updateName = _req.body;
    const result = await this.userService.updateName(updateName);
    return res
      .status(HttpStatusCodes.OK)
      .send({
        email: result.email,
        date: result.createdAt.toJSON().slice(0, 10).replace(/-/g, "/"),
        fullname: result.fullname
      })
      .end();
  }

  async updatePassword(_req: any, _res: IRes) {
    const newPass: UpdatePasswordDTO = _req.body;
    await this.userService.updatePassword(newPass);

    return _res.status(HttpStatusCodes.OK).end();
  }

  getUsers(): Promise<IUser[]> {
    return this.userService.getUsers();
  }

  async login(_req: any, _res: any) {
    const login: LoginDTO = _req.body;
    const account = await this.userService.login(login);
    const { id } = account;
    const token = jwt.sign({ id }, EnvVars.jwt.secret, { expiresIn: "1d" });

    return _res
      .status(HttpStatusCodes.OK)
      .json({
        token,
        id: account.id,
        email: account.email,
        fullname: account.fullname
      })
      .end();
  }

  async signup(_req: any, _res: any) {
    const signup: SignupDTO = _req.body;
    await this.userService.signup(signup);
    return _res.status(HttpStatusCodes.OK).end();
  }

  async googleAuthen(_req: any, _res: any) {
    const google: GoogleDTO = _req.body;
    const { user, newAccount } = await this.userService.googleAuthen(google);
    const { id } = user;
    const token = jwt.sign({ id }, EnvVars.jwt.secret, { expiresIn: "1d" });

    return _res
      .status(HttpStatusCodes.OK)
      .json({
        token,
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        newAccount
      })
      .end();
  }

  async renewPassword(_req: any, _res: IRes) {
    const renew: RenewPasswordDTO = _req.body;
    await this.userService.forgetPassword(renew);

    return _res.status(HttpStatusCodes.OK).end();
  }

  async activeAccount(_req: any, _res: any) {
    const { emailToken } = _req.params;
    await this.userService.activeAccount(emailToken);
    return _res.status(HttpStatusCodes.OK).end();
  }

  async getUser(_req: any, _res: any) {
    const { id } = _req.params;
    const result = await this.userService.getUser(id);

    return _res
      .status(HttpStatusCodes.OK)
      .send({
        email: result.email,
        date: result.createdAt.toJSON().slice(0, 10).replace(/-/g, "/"),
        fullname: result.fullname,
        password: result.password
      })
      .end();
  }

  async getMemberSelection(req: any, res: any) {
    const { id } = req.params;
    const result = await this.userService.getMember(id);
    const mapResult = result.map((u) => ({
      id: u.id,
      email: u.email
    }));
    res.header("Access-Control-Allow-Origin", "*");

    return res.status(HttpStatusCodes.OK).send(mapResult).end();
  }
}
