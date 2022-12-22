/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-return-await */
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import MemberOptionDTO from "@src/domains/dtos/MemberOptionDTO";
import {
  HeadingDTO,
  MutipleChoiceDTO,
  ParagraphDTO,
  PresentationDTO
} from "@src/domains/dtos/PresentationDTO";
import ViewPresentationDTO from "@src/domains/dtos/ViewPresentationDTO";
import { IRes } from "@src/domains/entities/types";
import {
  IAnswer,
  IHeading,
  IMutipleChoice,
  IParagraph,
  ISlide
} from "@src/domains/models/Presentation";
import { IUser } from "@src/domains/models/User";
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

    this.router.delete(
      "/:id",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.deletePresentation(_req, res)
    );
    this.router.get(
      "/getCollabs/:id",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.getCollabs(_req, res)
    );
    this.router.put(
      "/updateCollabs/:id",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.updateCollabs(_req, res)
    );
    this.router.get(
      "/presentationown/:id",
      passport.authenticate("jwt", { session: false }),

      async (_req, res) => await this.presentationOwn(_req, res)
    );
    this.router.get(
      "/presentationcollabs/:id",
      passport.authenticate("jwt", { session: false }),

      async (_req, res) => await this.presentationCollabs(_req, res)
    );
    return this.router;
  }

  async presentationOwn(_req: any, res: IRes) {
    const userId = _req.params;
    const creatorPrst = await this.presentationService.creatorGet(
      new Types.ObjectId(userId)
    );
    const creatorPresentationDTO: ViewPresentationDTO[] = creatorPrst.map(
      (p) => ({
        id: p.id,
        name: p.name,
        createdAt: p.createdAt,
        collabs: false
      })
    );

    return res.status(HttpStatusCodes.OK).send(creatorPresentationDTO).end();
  }

  async presentationCollabs(_req: any, res: IRes) {
    const userId = _req.params;
    const collabsPrst = await this.presentationService.collabsGet(
      new Types.ObjectId(userId)
    );
    const collabsPresentationDTO: ViewPresentationDTO[] = collabsPrst.map(
      (p) => ({
        id: p.id,
        name: p.name,
        createdAt: p.createdAt,
        collabs: true
      })
    );
    return res.status(HttpStatusCodes.OK).send(collabsPresentationDTO).end();
  }

  async updateCollabs(_req: any, res: IRes) {
    const updateCollabs = _req.body;
    const id = _req.params;
    await this.presentationService.updateCollabs(
      new Types.ObjectId(id),
      updateCollabs
    );
    return res.status(HttpStatusCodes.OK).end();
  }

  async getCollabs(_req: any, res: IRes) {
    const id = _req.params;
    const result = await this.presentationService.getCollabs(
      new Types.ObjectId(id)
    );
    const collabsMember: MemberOptionDTO[] = result.map((m: IUser) => ({
      id: m.id.toString(),
      email: m.email,
      fullname: m.fullname
    }));
    return res.status(HttpStatusCodes.OK).send(collabsMember).end();
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
          createdAt: g.createdAt,
          collabs: g.collabs
        }))
      )
      .end();
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
      creator: result.creator,
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
