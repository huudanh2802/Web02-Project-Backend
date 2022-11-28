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

  private inviteMember(email: string, link: number, name: string) {
    const mailOption = {
      from: EnvVars.email.name,
      to: email,
      subject: "Join kahot group",
      html: `<div style="background-color: #0fbbad; padding: 2em 2em;">
                      <h1 style="text-align: center;">You have been invited to join ${name} group as a member </h1>
                      <h4 style="text-align: center;">Please click <a href="http://${EnvVars.host}/group/${link}">here</a> to join</h4>
                  </div>`
    };

    mailer.sendMail(mailOption, function (err, info) {
      if (err) console.log(err);
    });
  }

  private inviteCoowner(email: string, link: number, name: string) {
    const mailOption = {
      from: EnvVars.email.name,
      to: email,
      subject: "Join kahot group",
      html: `<div style="background-color: #0fbbad; padding: 2em 2em;">
                        <h1 style="text-align: center;">You have been invited to join ${name} group as a Co-owner </h1>
                        <h4 style="text-align: center;">Please click <a href="http://${EnvVars.host}/group/${link}">here</a> to join</h4>
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
      id: new Types.ObjectId()
    };

    await this.groupRepository.create(newGroup);
    coowner.forEach((m) => {
      this.inviteCoowner(m.email, newGroup.link, newGroup.name);
    });
    member.forEach((m) => {
      this.inviteMember(m.email, newGroup.link, newGroup.name);
    });
  }
}
