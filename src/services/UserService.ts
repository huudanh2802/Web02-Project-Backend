import { IUser } from "@src/domains/models/User";
import UserRepository from "@src/repos/UserRepository";

import { injectable } from "tsyringe";

import * as bcrypt from "bcrypt";
import RouteError from "@src/declarations/classes";
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import { LoginDTO } from "@src/domains/dtos/LoginDTO";
import SignupDTO from "@src/domains/dtos/SignUpDTO";
import { GoogleDTO } from "@src/domains/dtos/GoogleDTO";

import * as crypto from "crypto";
import EnvVars from "@src/declarations/major/EnvVars";
import mailer from "@src/utils/nodemailler";
import { Types } from "mongoose";
import UpdateUserDTO from "@src/domains/dtos/UpdateUserDTO";
import { RenewPasswordDTO } from "@src/domains/dtos/RenewPasswordDTO";
import UpdatePasswordDTO from "@src/domains/dtos/UpdatePasswordDTO";

@injectable()
export default class UserService {
  userRepository: UserRepository;

  salt = 10;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  getUsers(): Promise<IUser[]> {
    return this.userRepository.all();
  }

  getUser(id: Types.ObjectId) {
    return this.userRepository.get(id);
  }

  async login(login: LoginDTO) {
    const user = await this.userRepository.getByEmail(login.email);
    if (!user) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, "User cannot be found");
    }
    // Check Active
    if (!user.active) {
      throw new RouteError(
        HttpStatusCodes.UNAUTHORIZED,
        "Account has not been active"
      );
    }
    // Check password
    const checkPass = await bcrypt.compare(login.password, user.password);
    if (!checkPass) {
      throw new RouteError(HttpStatusCodes.UNAUTHORIZED, "Invalid Password");
    }
    return user;
  }

  async forgetPassword(renew: RenewPasswordDTO) {
    const checkEmail = await this.userRepository.getByEmail(renew.email);
    if (!checkEmail) {
      throw new RouteError(
        HttpStatusCodes.NOT_FOUND,
        "User with this email cannot be found"
      );
    }

    const mailOption = {
      from: EnvVars.email.name,
      to: renew.email,
      subject: "Password Reset",
      html: `<div style="background-color: #0fbbad; padding: 2em 2em;">
                    <h1 style="text-align: center;">Your password has been reset</h1>
                    <h4 style="text-align: center;">Your new password is: 123456</h4>
                </div>`
    };
    mailer.sendMail(mailOption, function (err, info) {
      // eslint-disable-next-line no-console
      if (err) console.log(err);
    });
    const encryptedPassword = await bcrypt.hash("123456", 10);
    const newResult = await this.userRepository.renewPassword(
      renew.email,
      encryptedPassword
    );
    return newResult;
  }

  async signup(signup: SignupDTO) {
    const checkEmail = await this.userRepository.getByEmail(signup.email);
    if (checkEmail) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Email already existed"
      );
    }
    const hashPassword = await bcrypt.hash(signup.password, this.salt);
    const emailToken = crypto.randomBytes(20).toString("hex");

    const mailOption = {
      from: EnvVars.email.name,
      to: signup.email,
      subject: "Email verification",
      html: `<div style="background-color: #0fbbad; padding: 2em 2em;">
                    <h1 style="text-align: center;">Thank you for registering on our web</h1>
                    <h4 style="text-align: center;">Please click <a href="${EnvVars.clientHost}/confirm/${emailToken}">here</a> to activate your account</h4>
                </div>`
    };

    mailer.sendMail(mailOption, function (err, info) {
      // eslint-disable-next-line no-console
      if (err) console.log(err);
    });

    const newUser: IUser = {
      email: signup.email,
      password: hashPassword,
      fullname: signup.fullname,
      emailToken,
      active: false,
      id: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.userRepository.create(newUser);
  }

  async googleAuthen(google: GoogleDTO) {
    const user = await this.userRepository.getByEmail(google.email);
    if (!user) {
      const newUser: IUser = {
        email: google.email,
        fullname: google.fullname,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: "!NULL",
        emailToken: null,
        active: true,
        id: new Types.ObjectId()
      };

      await this.userRepository.create(newUser);
      return { user: newUser, newAccount: true };
    }

    // Check Active
    if (!user.active) {
      throw new RouteError(
        HttpStatusCodes.UNAUTHORIZED,
        "Account has not been active"
      );
    }

    return { user, newAccount: false };
  }

  async getMember(_id: Types.ObjectId): Promise<IUser[]> {
    const result = await this.userRepository.getMember(_id);
    return result;
  }

  async activeAccount(emailToken: string) {
    const account = await this.userRepository.activeEmailToken(emailToken);
    return account;
  }

  async updateName(name: UpdateUserDTO) {
    const newName = await this.userRepository.updateName(
      name.id,
      name.updatedName
    );
    return newName;
  }

  async updatePassword(password: UpdatePasswordDTO) {
    const user = await this.userRepository.getByEmail(password.email);
    const checkPass = await bcrypt.compare(password.oldPassword, user.password);
    if (!checkPass) {
      throw new RouteError(
        HttpStatusCodes.FORBIDDEN,
        "Old password does not match"
      );
    }
    const encryptedPassword = await bcrypt.hash(password.newPassword, 10);
    const newResult = await this.userRepository.updatePassword(
      password.email,
      encryptedPassword
    );
    return newResult;
  }
}
