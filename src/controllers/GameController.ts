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

  async getPresentation(_req: any, res: any) {
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

  async newGame(_req: any, res: any) {
    const { game, presentationId } = _req.body;
    const result = await this.gameService.createNewGame(game, presentationId);
    return res.status(HttpStatusCodes.OK).send(result.id);
  }
}
