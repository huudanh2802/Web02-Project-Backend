import { GroupModel, IGroup } from "@src/domains/models/Group";
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
}
