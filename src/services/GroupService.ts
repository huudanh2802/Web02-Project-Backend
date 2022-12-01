/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line no-console
import RouteError from "@src/declarations/classes";
import EnvVars from "@src/declarations/major/EnvVars";
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import NewGroupDTO from "@src/domains/dtos/NewGroupDTO";
import GroupRepository from "@src/repos/GroupRepository";
import UserRepository from "@src/repos/UserRepository";
import { Types } from "mongoose";
import mailer from "@src/utils/nodemailler";
import { injectable } from "tsyringe";
import { IGroup } from "@src/domains/models/Group";
import ModifyGroupDTO from "@src/domains/dtos/ModifyGroupDTO";
import { remove } from "fs-extra";
import { removeItem } from "@src/declarations/functions";

@injectable()
export default class GroupService {
  groupRepository: GroupRepository;

  userRepository: UserRepository;

  constructor(
    groupRepository: GroupRepository,
    userRepository: UserRepository
  ) {
    this.groupRepository = groupRepository;
    this.userRepository = userRepository;
  }

  async inviteByEmail(email: string, groupId: Types.ObjectId) {
    const group = await this.groupRepository.get(groupId);
    const user = await this.userRepository.getByEmail(email);
    if (!group) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Group cannot be found"
      );
    }
    if (!user) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, "User cannot be found");
    }
    if (
      group.coowner.includes(user.id) ||
      group.member.includes(user.id) ||
      group.owner === user.id
    ) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Member already existed in group"
      );
    }
    const mailOption = {
      from: EnvVars.email.name,
      to: email,
      subject: "Join kahot group",
      html: `<div style="background-color: #0fbbad; padding: 2em 2em;">
                      <h1 style="text-align: center;">You have been invited to join ${group.name} group as a member </h1>
                      <h4 style="text-align: center;">Please click <a href="${EnvVars.clientHost}/group/autojoin/${group.id}>here</a> to join</h4>
                  </div>`
    };

    mailer.sendMail(mailOption, function (err, info) {
      if (err) console.log(err);
    });
    return true;
  }

  async autojoin(userId: Types.ObjectId, groupId: Types.ObjectId) {
    const group = await this.groupRepository.get(groupId);
    const user = await this.userRepository.get(userId);
    if (!group) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Group cannot be found"
      );
    }
    if (!user) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, "User cannot be found");
    }
    if (
      group.coowner.includes(userId) ||
      group.member.includes(userId) ||
      group.owner === userId
    ) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Member already existed in group"
      );
    }
    group.member.push(userId);
    const result = await this.groupRepository.updateMember(group);
    return result;
  }

  private inviteMember(email: string, id: string, name: string) {
    const mailOption = {
      from: EnvVars.email.name,
      to: email,
      subject: "Join kahot group",
      html: `<div style="background-color: #0fbbad; padding: 2em 2em;">
                      <h1 style="text-align: center;">You have been invited to join ${name} group as a member </h1>
                      <h4 style="text-align: center;">Please click <a href="${EnvVars.clientHost}/group/detail/${id}>here</a> to join</h4>
                  </div>`
    };

    mailer.sendMail(mailOption, function (err, info) {
      if (err) console.log(err);
    });
  }

  private inviteCoowner(email: string, id: string, name: string) {
    const mailOption = {
      from: EnvVars.email.name,
      to: email,
      subject: "Join kahot group",
      html: `<div style="background-color: #0fbbad; padding: 2em 2em;">
                        <h1 style="text-align: center;">You have been invited to join ${name} group as a Co-owner </h1>
                        <h4 style="text-align: center;">Please click <a href="${EnvVars.clientHost}/group/detail/${id}>here</a> to join</h4>
                    </div>`
    };

    mailer.sendMail(mailOption, function (err, info) {
      if (err) console.log(err);
    });
  }

  async createNewGroup(newGroupDTO: NewGroupDTO) {
    const owner = await this.userRepository.get(
      new Types.ObjectId(newGroupDTO.owner.id)
    );
    const coowner = await this.userRepository.getMany(
      newGroupDTO.coowner.map((ng) => new Types.ObjectId(ng.id))
    );
    const member = await this.userRepository.getMany(
      newGroupDTO.member.map((ng) => new Types.ObjectId(ng.id))
    );
    if (coowner.length !== newGroupDTO.coowner.length) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "A co-owner cannot be found"
      );
    }
    if (member.length !== newGroupDTO.member.length) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "A member cannot be found"
      );
    }
    if (!owner) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Invalid owner");
    }
    let generateLink = Math.floor(Math.random() * 100000);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      let check = await this.groupRepository.checkLink(generateLink);
      if (!check) break;
      generateLink = Math.floor(Math.random() * 10000);
      check = this.groupRepository.checkLink(generateLink);
    }
    const newGroup: IGroup = {
      name: newGroupDTO.name,
      owner: new Types.ObjectId(newGroupDTO.owner.id),
      coowner: newGroupDTO.coowner.map((ng) => new Types.ObjectId(ng.id)),
      member: newGroupDTO.member.map((ng) => new Types.ObjectId(ng.id)),
      link: generateLink,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: new Types.ObjectId()
    };

    const result = await this.groupRepository.create(newGroup);
    coowner.forEach((m) => {
      this.inviteCoowner(m.email, result.id, newGroup.name);
    });
    member.forEach((m) => {
      this.inviteMember(m.email, result.id, newGroup.name);
    });
    return result;
  }

  async getOwnGroup(id: Types.ObjectId) {
    const result = await this.groupRepository.getOwnGroup(id);
    return result;
  }

  async checkOwnGroup(ownerId: Types.ObjectId, groupId: Types.ObjectId) {
    const result = await this.groupRepository.get(groupId);
    return (
      result.coowner.includes(ownerId.toString()) ||
      result.owner.toString() === ownerId.toString()
    );
  }

  async getMemberGroup(id: Types.ObjectId) {
    const result = await this.groupRepository.getMemberGroup(id);
    return result;
  }

  async get(id: Types.ObjectId) {
    const group = await this.groupRepository.get(id);
    const owner = await this.userRepository.get(group.owner);
    const coowner = await this.userRepository.getMany(group.coowner);
    const member = await this.userRepository.getMany(group.member);
    return { group, owner, coowner, member };
  }

  async deleteMember(modifyGroup: ModifyGroupDTO) {
    const group = await this.groupRepository.get(
      new Types.ObjectId(modifyGroup.id)
    );
    // Co owner
    if (modifyGroup.role === 1) {
      removeItem(group.coowner, modifyGroup.memberId);
    } else {
      removeItem(group.member, modifyGroup.memberId);
    }
    await this.groupRepository.updateMember(group);
    const owner = await this.userRepository.get(group.owner);
    const coowner = await this.userRepository.getMany(group.coowner);
    const member = await this.userRepository.getMany(group.member);
    return { group, owner, coowner, member };
  }

  async modifyMember(modifyGroup: ModifyGroupDTO) {
    const group = await this.groupRepository.get(
      new Types.ObjectId(modifyGroup.id)
    );
    // Co owner
    if (modifyGroup.role === 1) {
      removeItem(group.coowner, modifyGroup.memberId);
      group.member.push(modifyGroup.memberId);
    } else {
      removeItem(group.member, modifyGroup.memberId);
      group.coowner.push(modifyGroup.memberId);
    }
    await this.groupRepository.updateMember(group);
    const owner = await this.userRepository.get(group.owner);
    const coowner = await this.userRepository.getMany(group.coowner);
    const member = await this.userRepository.getMany(group.member);
    return { group, owner, coowner, member };
  }
}
