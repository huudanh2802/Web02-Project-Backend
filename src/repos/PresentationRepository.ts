import {
  IPresentation,
  PresentationModel
} from "@src/domains/models/Presentation";
import { Types } from "mongoose";
import { injectable } from "tsyringe";
import BaseRepository from "./BaseRepository";

@injectable()
export default class PresentationRepository extends BaseRepository<
  PresentationModel,
  IPresentation
> {
  constructor() {
    const presentationModel = new PresentationModel();
    super(presentationModel);
  }

  async creatorGet(userId: Types.ObjectId) {
    const result = await this.set.find({ creator: userId });
    return result;
  }

  async collabsGet(userId: Types.ObjectId) {
    const result = await this.set.find({ collabs: { $in: userId } });
    return result;
  }
}
