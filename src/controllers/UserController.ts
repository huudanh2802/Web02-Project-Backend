import { IUser } from "@src/domains/models/User";
import UserService from "@src/services/UserService";
import { Router } from "express";
import { autoInjectable } from "tsyringe";

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

  routes() {
    this.router.get("/get", async (_req, res) =>
      res.send(await this.getUsers())
    );
    return this.router;
  }
}
