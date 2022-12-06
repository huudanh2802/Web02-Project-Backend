import PresentationRepository from "@src/repos/PresentationRepository";
import { injectable } from "tsyringe";

@injectable()
export default class GameService {
  presentationRepository: PresentationRepository;

  constructor(presentationRepository: PresentationRepository) {
    this.presentationRepository = presentationRepository;
  }
}
