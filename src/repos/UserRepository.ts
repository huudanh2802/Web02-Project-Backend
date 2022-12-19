/* eslint-disable object-shorthand */
import UpdateUserDTO from "@src/domains/dtos/UpdateUserDTO";
import { IUser, UserModel } from "@src/domains/models/User";
import { Types } from "mongoose";
import { injectable } from "tsyringe";
import { RenewPasswordDTO } from "@src/domains/dtos/RenewPasswordDTO";
import * as bcrypt from "bcrypt";
import UpdatePasswordDTO from "@src/domains/dtos/UpdatePasswordDTO";
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

  async updateName(name: UpdateUserDTO) {
    const newResult = await this.set.findOne({ _id: name.id });
    return newResult;
  }

  async updatePassword(password: UpdatePasswordDTO) {
    const encryptedPassword = await bcrypt.hash(password.newPassword, 10);
    const newResult = await this.set.updateOne(
      { _id: password.id },
      {
        $set: {
          password: encryptedPassword
        }
      }
    );
    return newResult;
  }

  async renewPassword(renew: RenewPasswordDTO) {
    const encryptedPassword = await bcrypt.hash("123456", 10);
    const newResult = await this.set.updateOne(
      { email: renew.email },
      {
        $set: {
          password: encryptedPassword
        }
      }
    );
    return newResult;
  }
}
