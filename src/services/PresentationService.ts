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

  async newPresentation(newPresentationDTO: PresentationDTO) {
    const newPresentation: IPresentation = {
      name: newPresentationDTO.name,
      groupId: new Types.ObjectId(newPresentationDTO.groupId),
      slides: newPresentationDTO.slides.map((s) => ({
        question: s.question,
        correct: s.correct,
        answers: s.answers.map((a) => ({
          id: a.id,
          answer: a.answer
        }))
      })),
      createdAt: new Date(),
      id: new Types.ObjectId()
    };
    await this.presentationRepository.create(newPresentation);
    return newPresentation.id;
  }

  async updatePresentation(
    presentationDTO: PresentationDTO,
    presentationId: Types.ObjectId
  ) {
    const oPresent = await this.presentationRepository.get(presentationId);
    const updatePresentation: IPresentation = {
      name: presentationDTO.name,
      groupId: new Types.ObjectId(presentationDTO.groupId),
      slides: presentationDTO.slides.map((s) => ({
        question: s.question,
        correct: s.correct,
        answers: s.answers.map((a) => ({
          id: a.id,
          answer: a.answer
        }))
      })),
      createdAt: oPresent.createdAt,
      id: presentationId
    };
    await this.presentationRepository.update(updatePresentation);
    return presentationId;
  }

  async groupGet(groupId: Types.ObjectId) {
    const result = await this.presentationRepository.groupGet(groupId);
    return result;
  }

  async getPresentation(id: Types.ObjectId) {
    const result = await this.presentationRepository.get(id);
    if (!result) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Presentation don't exist"
      );
    }
    return result;
  }
}
