import { IUser, UserModel } from "@src/domains/models/User";
import { injectable } from "tsyringe";
import BaseRepository from "./BaseRepository";

@injectable()
export default class UserRepository extends BaseRepository<UserModel, IUser> {
  constructor() {
    const usermodel = new UserModel();
    super(usermodel);
  }
}
