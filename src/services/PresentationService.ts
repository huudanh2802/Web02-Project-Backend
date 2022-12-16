import RouteError from "@src/declarations/classes";
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import PresentationDTO, {
  AnswerDTO,
  HeadingDTO,
  MutipleChoiceDTO,
  ParagraphDTO,
  PresentationDTOV2,
  Slide
} from "@src/domains/dtos/PresentationDTO";
import {
  IAnswer,
  IHeading,
  IMutipleChoice,
  IParagraph,
  IPresentation,
  ISlide
} from "@src/domains/models/Presentation";
import PresentationRepository from "@src/repos/PresentationRepository";
import { Types } from "mongoose";
import { injectable } from "tsyringe";

@injectable()
export default class PresentationService {
  presentationRepository: PresentationRepository;

  constructor(presentationRepository: PresentationRepository) {
    this.presentationRepository = presentationRepository;
  }

  async newPresentation(newPresentationDTO: PresentationDTOV2) {
    const newPresentation: IPresentation = {
      name: newPresentationDTO.name,
      creator: new Types.ObjectId(newPresentationDTO.creator),
      slides: newPresentationDTO.slides.map((slide: Slide) => {
        switch (slide.type) {
          case 1: {
            const convertSlide = slide as MutipleChoiceDTO;
            const mutipleChoice: IMutipleChoice = {
              type: 1,
              question: convertSlide.question,
              correct: convertSlide.correct,
              answers: convertSlide.answers.map((a: AnswerDTO) => ({
                id: a.id,
                answer: a.answer
              }))
            };
            return mutipleChoice;
          }
          case 2: {
            const convertSlide = slide as HeadingDTO;
            const heading: IHeading = {
              type: 2,
              heading: convertSlide.heading
            };
            return heading;
          }
          case 3: {
            const convertSlide = slide as ParagraphDTO;
            const paragraph: IParagraph = {
              type: 3,
              paragraph: convertSlide.paragraph,
              heading: convertSlide.heading
            };
            return paragraph;
          }
          default: {
            const empty: ISlide = {
              type: 0
            };
            return empty;
          }
        }
      }),
      createdAt: new Date(),
      id: new Types.ObjectId()
    };
    const result = await this.presentationRepository.create(newPresentation);
    return result.id;
  }

  async updatePresentation(
    presentationDTO: PresentationDTOV2,
    presentationId: Types.ObjectId
  ) {
    const oPresent = await this.presentationRepository.get(presentationId);
    const updatePresentation: IPresentation = {
      name: presentationDTO.name,
      creator: new Types.ObjectId(presentationDTO.creator),
      slides: presentationDTO.slides.map((slide: Slide) => {
        switch (slide.type) {
          case 1: {
            const convertSlide = slide as MutipleChoiceDTO;
            const mutipleChoice: IMutipleChoice = {
              type: 1,
              question: convertSlide.question,
              correct: convertSlide.correct,
              answers: convertSlide.answers.map((a: AnswerDTO) => ({
                id: a.id,
                answer: a.answer
              }))
            };
            return mutipleChoice;
          }
          case 2: {
            const convertSlide = slide as HeadingDTO;
            const heading: IHeading = {
              type: 2,
              heading: convertSlide.heading
            };
            return heading;
          }
          case 3: {
            const convertSlide = slide as ParagraphDTO;
            const paragraph: IParagraph = {
              type: 3,
              paragraph: convertSlide.paragraph,
              heading: convertSlide.heading
            };
            return paragraph;
          }
          default: {
            const empty: ISlide = {
              type: 0
            };
            return empty;
          }
        }
      }),
      createdAt: oPresent.createdAt,
      id: presentationId
    };
    await this.presentationRepository.update(updatePresentation);
    return presentationId;
  }

  async creatorGet(userId: Types.ObjectId) {
    const result = await this.presentationRepository.creatorGet(userId);
    return result;
  }

  async collabsGet(userId: Types.ObjectId) {
    const result = await this.presentationRepository.collabsGet(userId);
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

  async deletePresentation(id: Types.ObjectId) {
    const presentation = await this.presentationRepository.get(id);
    await this.presentationRepository.delete(id);
    const creator = await this.presentationRepository.creatorGet(
      presentation.creator
    );
    const collabs = await this.presentationRepository.collabsGet(
      presentation.creator
    );
    return [...creator, ...collabs];
  }
}
