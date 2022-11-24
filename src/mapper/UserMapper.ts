/* eslint-disable class-methods-use-this */
import { PojosMetadataMap } from "@automapper/pojos";
import { LoginDTO } from "@src/domains/dtos/LoginDTO";
import { IUser } from "@src/domains/models/User";

export default class UserMapping {
  createUser() {
    PojosMetadataMap.create<IUser>("IUser", {
      email: String,
      password: String
    });
  }

  createLoginDTO() {
    PojosMetadataMap.create<LoginDTO>("LoginDTO", {
      email: String,
      password: String
    });
  }
}
