/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-return-await */
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import GameService from "@src/services/GameService";
import PresentationService from "@src/services/PresentationService";
import { IRes } from "@src/domains/entities/types";
import { IAnswer, ISlide } from "@src/domains/models/Presentation";
import { Router } from "express";
import { autoInjectable } from "tsyringe";
import passport from "passport";
import { Types } from "mongoose";
import PresentationDTO from "@src/domains/dtos/PresentationDTO";
import { GameDTO } from "@src/domains/dtos/GameDTO";

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
    this.router.post(
      "/newgame",
      passport.authenticate("jwt", { session: false }),
      async (_req, res) => await this.newGame(_req, res)
    );

    return this.router;
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

  async newGame(_req: any, res: IRes) {
    const { game, presentationId } = _req.body;
    const result = await this.gameService.createNewGame(game, presentationId);
    return res.status(HttpStatusCodes.OK).send(result.id);
  }
}
