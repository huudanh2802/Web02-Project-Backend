/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IRes } from "@src/domains/entities/types";
import GroupService from "@src/services/GroupService";
import { Router } from "express";
import { autoInjectable } from "tsyringe";
import NewGroupDTO from "@src/domains/dtos/NewGroupDTO";
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";

@autoInjectable()
export default class GroupController {
  private router: Router;

  private groupService: GroupService;

  constructor(groupService: GroupService) {
    this.groupService = groupService;
    this.router = Router();
  }

  routes() {
    this.router.post(
      "/newgroup",
      async (_req, res) => await this.newGroup(_req, res)
    );
    return this.router;
  }

  async newGroup(_req: any, res: IRes) {
    const newGroup: NewGroupDTO = _req.body;
    try {
      await this.groupService.createNewGroup(newGroup);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
    return res.status(HttpStatusCodes.OK).end();
  }
}
