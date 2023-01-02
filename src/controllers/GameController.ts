/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-return-await */
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import {
  HeadingDTO,
  MutipleChoiceDTO,
  ParagraphDTO,
  PresentationDTO
} from "@src/domains/dtos/PresentationDTO";
import {
  IAnswer,
  IHeading,
  IMutipleChoice,
  IParagraph,
  ISlide
} from "@src/domains/models/Presentation";
import GameService from "@src/services/GameService";
import PresentationService from "@src/services/PresentationService";
import { Router } from "express";
import { Types } from "mongoose";
import passport from "passport";
import { autoInjectable } from "tsyringe";
import RouteError from "@src/declarations/classes";
import { IRes } from "@src/domains/entities/types";
import ViewPresentationDTO from "@src/domains/dtos/ViewPresentationDTO";

@autoInjectable()
export default class GameController {
  private router: Router;

  private gameService: GameService;

  private presentationService: PresentationService;

  constructor(
    gameService: GameService,
    presentationService: PresentationService
  ) {
    this.gameService = gameService;
    this.presentationService = presentationService;
    this.router = Router();
  }

  routes() {
    this.router.get(
      "/get/:id",
      async (_req, res) => await this.getPresentation(_req, res)
    );
    this.router.get(
      "/currentPresentation/:groupId",
      async (_req, res) => await this.getCurrentPresentation(_req, res)
    );
    this.router.post(
      "/newgame",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.newGame(_req, res)
    );
    this.router.get(
      "/getview/:id",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.getViewPresentation(_req, res)
    );
    this.router.get(
      "/getsession/:presentationId",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.getGameSessions(_req, res)
    );
    return this.router;
  }

  async getViewPresentation(_req: any, res: IRes) {
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
    return res
      .status(HttpStatusCodes.OK)
      .send([...creatorPresentationDTO, ...collabsPresentationDTO])
      .end();
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
    // console.log(presentationDTO);
    return res.status(HttpStatusCodes.OK).send(presentationDTO).end();
  }

  async getCurrentPresentation(_req: any, res: IRes) {
    const { groupId } = _req.params;
    const result = await this.gameService.getCurrentPresentation(groupId);
    if (result.success) return res.status(HttpStatusCodes.OK).send(result);
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "No current game");
  }

  async newGame(_req: any, res: IRes) {
    const { game, presentationId, groupId } = _req.body;
    const result = await this.gameService.createNewGame(
      game,
      presentationId,
      groupId
    );

    return res.status(HttpStatusCodes.OK).send(result.id);
  }

  async getGameSessions(_req: any, res: IRes) {
    const { presentationId } = _req.params;
    const result = await this.gameService.getGameSessions(
      new Types.ObjectId(presentationId)
    );
    return res.status(HttpStatusCodes.OK).send(result).end();
  }
}
