/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-return-await */
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import NewPresentationDTO from "@src/domains/dtos/NewPresentationDTO";
import { IRes } from "@src/domains/entities/types";
import PresentationService from "@src/services/PresentationService";
import { Router } from "express";
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
      async (_req, res) => await this.newPresentation(_req, res)
    );
    return this.router;
  }

  async newPresentation(_req: any, res: IRes) {
    const newPresentationDTO: NewPresentationDTO = _req.body;
    const id = await this.presentationService.newPresentation(
      newPresentationDTO
    );
    return res.status(HttpStatusCodes.OK).send(id).end();
  }
}
