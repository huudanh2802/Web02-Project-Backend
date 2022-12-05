/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-return-await */
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import PresentationDTO from "@src/domains/dtos/PresentationDTO";
import { IRes } from "@src/domains/entities/types";
import { IAnswer, ISlide } from "@src/domains/models/Presentation";
import RealtimeService from "@src/services/RealtimeService";
import { Router } from "express";
import { Types } from "mongoose";
import passport from "passport";
import { autoInjectable } from "tsyringe";

@autoInjectable()
export default class PresentationController {
  private router: Router;

  private realtimeService: RealtimeService;

  constructor(realtimeService: RealtimeService) {
    this.realtimeService = realtimeService;
    this.router = Router();
  }

  routes() {
    return this.router;
  }
}
