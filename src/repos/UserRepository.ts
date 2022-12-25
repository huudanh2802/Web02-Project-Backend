/* eslint-disable object-shorthand */
import { IUser, UserModel } from "@src/domains/models/User";
import { Types } from "mongoose";
import { injectable } from "tsyringe";
import BaseRepository from "./BaseRepository";

@injectable()
export default class UserRepository extends BaseRepository<UserModel, IUser> {
  constructor() {
    const usermodel = new UserModel();
    super(usermodel);
  }

  async getByEmail(loginEmail: string): Promise<IUser> {
    // eslint-disable-next-line no-console
    const result = await this.set.findOne({ email: loginEmail });

    return result;
  }

  async activeEmailToken(emailToken: string): Promise<IUser> {
    const account = await this.set.findOneAndUpdate(
      { emailToken: emailToken },
      { emailToken: null, active: true }
    );
    return account;
  }

  async getMember(_id: Types.ObjectId) {
    const result = await this.set.find({ _id: { $ne: _id } });
    return result;
  }

  async updateName(confirmId: string, newName: string) {
    const newResult = await this.set.findOneAndUpdate(
      { _id: confirmId },
      { fullname: newName }
    );
    return newResult;
  }

  async updatePassword(confirmEmail: string, newPassword: string) {
    const newResult = await this.set.findOneAndUpdate(
      { email: confirmEmail },
      { password: newPassword }
    );
    return newResult;
  }

  async renewPassword(confirmEmail: string, newPassword: string) {
    const newResult = await this.set.findOneAndUpdate(
      { email: confirmEmail },
      { password: newPassword }
    );
    return newResult;
  }
}
