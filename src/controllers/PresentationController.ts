/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-return-await */
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import PresentationDTO, {
  HeadingDTO,
  MutipleChoiceDTO,
  ParagraphDTO,
  PresentationDTOV2
} from "@src/domains/dtos/PresentationDTO";
import { IRes } from "@src/domains/entities/types";
import {
  IAnswer,
  IHeading,
  IMutipleChoice,
  IParagraph,
  ISlide
} from "@src/domains/models/Presentation";
import PresentationService from "@src/services/PresentationService";
import { Router } from "express";
import { Types } from "mongoose";
import passport from "passport";
import { autoInjectable } from "tsyringe";

@autoInjectable()
export default class PresentationController {
  private router: Router;

  private presentationService: PresentationService;

  constructor(presentationService: PresentationService) {
    this.presentationService = presentationService;
    this.router = Router();
  }

  routes() {
    this.router.post(
      "/newpresentation",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.newPresentation(_req, res)
    );
    this.router.get(
      "/get/:id",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.getPresentation(_req, res)
    );
    this.router.put(
      "/update/:id",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.updatePresentation(_req, res)
    );
    this.router.get(
      "/groupget/:id",
      passport.authenticate("jwt", { session: false }),

      async (_req, res) => await this.groupGet(_req, res)
    );
    this.router.delete(
      "/:id",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.deletePresentation(_req, res)
    );
    return this.router;
  }

  async deletePresentation(_req: any, res: IRes) {
    const id = _req.params;
    const result = await this.presentationService.deletePresentation(
      new Types.ObjectId(id)
    );
    return res
      .status(HttpStatusCodes.OK)
      .send(
        result.map((g) => ({
          id: g.id,
          name: g.name,
          createdAt: g.createdAt
        }))
      )
      .end();
  }

  async groupGet(_req: any, res: IRes) {
    const groupId = _req.params;
    const result = await this.presentationService.groupGet(
      new Types.ObjectId(groupId)
    );
    return res
      .status(HttpStatusCodes.OK)
      .send(
        result.map((g) => ({
          id: g.id,
          name: g.name,
          createdAt: g.createdAt
        }))
      )
      .end();
  }

  async newPresentation(_req: any, res: IRes) {
    const newPresentationDTO: PresentationDTOV2 = _req.body;
    const id = await this.presentationService.newPresentation(
      newPresentationDTO
    );
    return res.status(HttpStatusCodes.OK).send(id).end();
  }

  async updatePresentation(_req: any, res: IRes) {
    const presentationId = _req.params;
    const presentationDTO: PresentationDTOV2 = _req.body;
    const id = await this.presentationService.updatePresentation(
      presentationDTO,
      new Types.ObjectId(presentationId)
    );
    return res.status(HttpStatusCodes.OK).end();
  }

  async getPresentation(_req: any, res: IRes) {
    const id = _req.params;
    const result = await this.presentationService.getPresentation(
      new Types.ObjectId(id)
    );
    const presentationDTO: PresentationDTOV2 = {
      name: result.name,
      groupId: result.groupId,
      slides: result.slides.map((slide: ISlide, idx: number) => {
        switch (slide.type) {
          case 1: {
            const convertSlide = slide as IMutipleChoice;
            const mutipleChoice: MutipleChoiceDTO = {
              idx,
              type: 1,
              question: convertSlide.question,
              correct: convertSlide.correct,
              answers: convertSlide.answers.map((a: IAnswer) => ({
                id: a.id,
                answer: a.answer,
                placeHolder: `${a.id}.`
              }))
            };
            return mutipleChoice;
          }
          case 2: {
            const convertSlide = slide as IHeading;
            const heading: HeadingDTO = {
              idx,
              type: 2,
              heading: convertSlide.heading
            };
            return heading;
          }
          case 3: {
            const convertSlide = slide as IParagraph;
            const paragraph: ParagraphDTO = {
              idx,
              type: 3,
              paragraph: convertSlide.paragraph,
              heading: convertSlide.heading
            };
            return paragraph;
          }
          default:
            return null;
        }
      })
    };
    return res.status(HttpStatusCodes.OK).send(presentationDTO).end();
  }
}
