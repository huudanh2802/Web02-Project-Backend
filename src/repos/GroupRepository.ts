import { GroupModel, IGroup } from "@src/domains/models/Group";
import { Types } from "mongoose";
import { injectable } from "tsyringe";
import BaseRepository from "./BaseRepository";

@injectable()
export default class UserRepository extends BaseRepository<GroupModel, IGroup> {
  constructor() {
    const groupModel = new GroupModel();
    super(groupModel);
  }

  async checkLink(link: number) {
    const result = await this.set.findOne({ link });
    return result;
  }

  async getOwnGroup(id: Types.ObjectId) {
    const result = await this.set.find({
      owner: id
    });
    return result;
  }

  async getMemberGroup(id: Types.ObjectId) {
    const result = await this.set.find({
      $or: [{ member: { $in: id } }, { coowner: { $in: id } }]
    });
    return result;
  }

  async updateMember(updateModel: IGroup) {
    const group = await this.set.findOneAndUpdate(
      { _id: updateModel.id },
      { coowner: updateModel.coowner, member: updateModel.member }
    );
    return group;
  }
}
