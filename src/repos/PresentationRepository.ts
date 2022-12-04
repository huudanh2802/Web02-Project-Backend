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

  async groupGet(groupId: Types.ObjectId) {
    const result = await this.set.find({ groupId });
    return result;
  }
}
