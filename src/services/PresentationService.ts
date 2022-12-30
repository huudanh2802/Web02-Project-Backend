/* eslint-disable @typescript-eslint/no-non-null-assertion */
import RouteError from "@src/declarations/classes";
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import MemberOptionDTO from "@src/domains/dtos/MemberOptionDTO";
import {
  AnswerDTO,
  HeadingDTO,
  MutipleChoiceDTO,
  ParagraphDTO,
  PresentationDTO,
  SlideDTO
} from "@src/domains/dtos/PresentationDTO";
import {
  IHeading,
  IMutipleChoice,
  IParagraph,
  IPresentation,
  ISlide
} from "@src/domains/models/Presentation";
import { IUser } from "@src/domains/models/User";
import PresentationRepository from "@src/repos/PresentationRepository";
import UserRepository from "@src/repos/UserRepository";
import { Types } from "mongoose";
import { injectable } from "tsyringe";

@injectable()
export default class PresentationService {
  presentationRepository: PresentationRepository;

  userRepository: UserRepository;

  constructor(
    presentationRepository: PresentationRepository,
    userRepository: UserRepository
  ) {
    this.presentationRepository = presentationRepository;
    this.userRepository = userRepository;
  }

  async checkAutho(presentId: Types.ObjectId, userId: Types.ObjectId) {
    const present: IPresentation = await this.presentationRepository.get(
      presentId
    );
    if (present.creator.toString() !== userId.toString()) {
      if (
        // eslint-disable-next-line no-underscore-dangle
        !present.collabs.some((a) => a._id.toString() === userId.toString())
      ) {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          "User cannot view this presentation"
        );
      }
    }
  }

  async updateCollabs(id: Types.ObjectId, newCollabs: MemberOptionDTO[]) {
    const presentation: IPresentation = await this.presentationRepository.get(
      id
    );
    presentation.collabs = newCollabs.map((m) => new Types.ObjectId(m.id));
    await this.presentationRepository.update(presentation);
    return presentation.id;
  }

  async getCollabs(id: Types.ObjectId) {
    const presentation: IPresentation = await this.presentationRepository.get(
      id
    );
    const collabs: IUser[] = await this.userRepository.getMany(
      presentation.collabs!
    );
    return collabs;
  }

  async newPresentation(newPresentationDTO: PresentationDTO) {
    const newPresentation: IPresentation = {
      name: newPresentationDTO.name,
      creator: new Types.ObjectId(newPresentationDTO.creator),
      collabs: [],
      slides: newPresentationDTO.slides.map((slide: SlideDTO) => {
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
    presentationDTO: PresentationDTO,
    presentationId: Types.ObjectId
  ) {
    const oPresent = await this.presentationRepository.get(presentationId);
    const updatePresentation: IPresentation = {
      name: presentationDTO.name,
      creator: new Types.ObjectId(presentationDTO.creator),
      collabs: oPresent.collabs,
      slides: presentationDTO.slides.map((slide: SlideDTO) => {
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
