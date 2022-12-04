import NewPresentationDTO from "@src/domains/dtos/NewPresentationDTO";
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

  async newPresentation(newPresentationDTO: NewPresentationDTO) {
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
      id: new Types.ObjectId()
    };
    await this.presentationRepository.create(newPresentation);
    return newPresentation.id;
  }
}
