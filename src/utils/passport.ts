import RouteError from "@src/declarations/classes";
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import UserRepository from "@src/repos/UserRepository";
import { PassportStatic } from "passport";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import EnvVars from "@src/declarations/major/EnvVars";

export const errors = {
  unauth: "Unauthorized",
  emailNotFound: (email: string) => `User with email "${email}" not found`
} as const;

export default (passport: PassportStatic) => {
  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: EnvVars.jwt.secret
      },
      async (payload, done) => {
        const userRepository = new UserRepository();
        const user = await userRepository.get(payload.id);
        // eslint-disable-next-line no-console
        if (!user) {
          throw new RouteError(
            HttpStatusCodes.NOT_FOUND,
            "User cannot be found"
          );
        }
        return done(null, user);
      }
    )
  );
};
