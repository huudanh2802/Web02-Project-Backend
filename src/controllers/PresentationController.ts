/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-return-await */
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import PresentationDTO from "@src/domains/dtos/PresentationDTO";
import { IRes } from "@src/domains/entities/types";
import { IAnswer, ISlide } from "@src/domains/models/Presentation";
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
    return this.router;
  }

  async newPresentation(_req: any, res: IRes) {
    const newPresentationDTO: PresentationDTO = _req.body;
    const id = await this.presentationService.newPresentation(
      newPresentationDTO
    );
    return res.status(HttpStatusCodes.OK).send(id).end();
  }

  async updatePresentation(_req: any, res: IRes) {
    const presentationId = _req.params;
    const presentationDTO: PresentationDTO = _req.body;
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
    const presentationDTO: PresentationDTO = {
      name: result.name,
      groupId: result.groupId,
      slides: result.slides.map((s: ISlide, idx: number) => ({
        idx,
        question: s.question,
        correct: s.correct,
        answers: s.answers.map((a: IAnswer) => ({
          id: a.id,
          answer: a.answer,
          placeHolder: `Option ${a.id}`
        }))
      }))
    };
    return res.status(HttpStatusCodes.OK).send(presentationDTO).end();
  }
}
