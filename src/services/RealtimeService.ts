import RouteError from "@src/declarations/classes";
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import PresentationDTO from "@src/domains/dtos/PresentationDTO";
import { IPresentation } from "@src/domains/models/Presentation";
import PresentationRepository from "@src/repos/PresentationRepository";
import { Types } from "mongoose";
import { injectable } from "tsyringe";

@injectable()
export default class PresentationService {
  presentationRepository: PresentationRepository;

  constructor(presentationRepository: PresentationRepository) {
    this.presentationRepository = presentationRepository;
  }
}
