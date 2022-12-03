/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IRes } from "@src/domains/entities/types";
import GroupService from "@src/services/GroupService";
import { Router } from "express";
import { autoInjectable } from "tsyringe";
import NewGroupDTO from "@src/domains/dtos/NewGroupDTO";
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import GroupDTO from "@src/domains/dtos/GroupDTO";
import CheckOwnerDTO from "@src/domains/dtos/CheckOwnerDTO";
import GroupInfoDTO from "@src/domains/dtos/GroupInfoDTO";
import ModifyGroupDTO from "@src/domains/dtos/ModifyGroupDTO";
import passport from "passport";
import { Types } from "mongoose";

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
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.newGroup(_req, res)
    );
    this.router.get(
      "/owngroup/:id",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.getOwnGroup(_req, res)
    );
    this.router.get(
      "/membergroup/:id",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.getMemberGroup(_req, res)
    );
    this.router.post(
      "/checkowner",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.checkOwner(_req, res)
    );
    this.router.delete(
      "/member",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.deleteMember(_req, res)
    );
    this.router.put(
      "/member",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.modifyMember(_req, res)
    );
    this.router.get(
      "/get/:id",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.get(_req, res)
    );
    this.router.post(
      "/autojoin/:id",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.autoJoin(_req, res)
    );
    this.router.post(
      "/invitebyemail/:id",
      async (_req, res) => await this.inviteByEmail(_req, res)
    );

    return this.router;
  }

  async inviteByEmail(_req: any, res: IRes) {
    const email = _req.body;
    const groupId = _req.params;
    await this.groupService.inviteByEmail(
      email.email,
      new Types.ObjectId(groupId)
    );

    return res
      .status(HttpStatusCodes.OK)
      .send("Member has been invited by email")
      .end();
  }

  async autoJoin(_req: any, res: IRes) {
    const userId = _req.body;
    const groupId = _req.params;
    const result = await this.groupService.autojoin(
      new Types.ObjectId(userId.userId),
      new Types.ObjectId(groupId)
    );
    return res.status(HttpStatusCodes.OK).send(result.id).end();
  }

  async modifyMember(_req: any, res: IRes) {
    const modifyGroup: ModifyGroupDTO = _req.body;
    const { group, owner, coowner, member } =
      await this.groupService.modifyMember(modifyGroup);
    const result: GroupInfoDTO = {
      id: group.id,
      name: group.name,
      owner: {
        id: owner.id,
        fullname: owner.fullname,
        email: owner.email
      },
      coowner: coowner.map((m) => ({
        id: m.id.toString(),
        fullname: m.fullname,
        email: m.email
      })),
      member: member.map((m) => ({
        id: m.id.toString(),
        fullname: m.fullname,
        email: m.email
      }))
    };
    return res.status(HttpStatusCodes.OK).send(result).end();
  }

  async deleteMember(_req: any, res: IRes) {
    const modifyGroup: ModifyGroupDTO = _req.body;
    const { group, owner, coowner, member } =
      await this.groupService.deleteMember(modifyGroup);
    const result: GroupInfoDTO = {
      id: group.id,
      name: group.name,
      owner: {
        id: owner.id,
        fullname: owner.fullname,
        email: owner.email
      },
      coowner: coowner.map((m) => ({
        id: m.id.toString(),
        fullname: m.fullname,
        email: m.email
      })),
      member: member.map((m) => ({
        id: m.id.toString(),
        fullname: m.fullname,
        email: m.email
      }))
    };
    return res.status(HttpStatusCodes.OK).send(result).end();
  }

  async get(_req: any, res: IRes) {
    const { id } = _req.params;
    const { group, owner, coowner, member } = await this.groupService.get(id);
    // eslint-disable-next-line no-console
    const result: GroupInfoDTO = {
      id: group.id,
      name: group.name,
      owner: {
        id: owner.id,
        fullname: owner.fullname,
        email: owner.email
      },
      coowner: coowner.map((m) => ({
        id: m.id.toString(),
        fullname: m.fullname,
        email: m.email
      })),
      member: member.map((m) => ({
        id: m.id.toString(),
        fullname: m.fullname,
        email: m.email
      }))
    };
    return res.status(HttpStatusCodes.OK).send(result).end();
  }

  async checkOwner(_req: any, res: IRes) {
    const checkOwner: CheckOwnerDTO = _req.body;
    // eslint-disable-next-line no-console
    console.log(_req.body);
    const ownGroups = await this.groupService.checkOwnGroup(
      checkOwner.ownerId,
      checkOwner.groupId
    );
    return res.status(HttpStatusCodes.OK).send(ownGroups).end();
  }

  async getOwnGroup(_req: any, res: IRes) {
    const { id } = _req.params;
    const result = await this.groupService.getOwnGroup(id);
    const groupDto: GroupDTO[] = result.map((g) => ({
      id: g.id,
      name: g.name,
      memberNum: g.member.length,
      createdAt: g.createdAt
    }));
    return res.status(HttpStatusCodes.OK).send(groupDto).end();
  }

  async getMemberGroup(_req: any, res: IRes) {
    const { id } = _req.params;
    const result = await this.groupService.getMemberGroup(id);
    const groupDto: GroupDTO[] = result.map((g) => ({
      id: g.id,
      name: g.name,
      memberNum: g.member.length,
      createdAt: g.createdAt
    }));
    return res.status(HttpStatusCodes.OK).send(groupDto).end();
  }

  async newGroup(_req: any, res: IRes) {
    const newGroup: NewGroupDTO = _req.body;
    const result = await this.groupService.createNewGroup(newGroup);
    return res.status(HttpStatusCodes.OK).send(result.id).end();
  }
}
