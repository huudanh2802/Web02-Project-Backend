/* eslint-disable object-shorthand */
import { IUser, UserModel } from "@src/domains/models/User";
import { injectable } from "tsyringe";
import BaseRepository from "./BaseRepository";

@injectable()
export default class UserRepository extends BaseRepository<UserModel, IUser> {
  constructor() {
    const usermodel = new UserModel();
    super(usermodel);
  }

  async getByEmail(loginEmail: string) {
    // eslint-disable-next-line no-console
    const result = await this.set.findOne({ email: loginEmail });

    return result;
  }
}
