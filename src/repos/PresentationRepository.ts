import {
  IPresentation,
  PresentationModel
} from "@src/domains/models/Presentation";
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
}
