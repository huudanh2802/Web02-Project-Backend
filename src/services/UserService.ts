import { IUser } from "@src/domains/models/User";
import UserRepository from "@src/repos/UserRepository";

import { injectable } from "tsyringe";

@injectable()
export default class UserService {
  userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  getUsers(): Promise<IUser[]> {
    return this.userRepository.all();
  }
}
