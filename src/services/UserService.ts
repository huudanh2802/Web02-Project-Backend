import { IUser } from "@src/domains/models/User";
import UserRepository from "@src/repos/UserRepository";

import { injectable } from "tsyringe";

import * as bcrypt from "bcrypt";
import RouteError from "@src/declarations/classes";
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import { LoginDTO } from "@src/domains/dtos/LoginDTO";

@injectable()
export default class UserService {
  userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  getUsers(): Promise<IUser[]> {
    return this.userRepository.all();
  }

  async login(login: LoginDTO) {
    const account = await this.userRepository.getByEmail(login.email);
    if (!account) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, "User cannot be found");
    }
    const checkPass = await bcrypt.compare(login.password, account.password);
    if (!checkPass) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Invalid password");
    }
  }
}
