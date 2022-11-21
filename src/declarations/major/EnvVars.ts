export default {
  nodeEnv: process.env.NODE_ENV ?? "",
  port: process.env.PORT ?? 0,
  cookieProps: {
    key: "ExpressGeneratorTs",
    secret: process.env.COOKIE_SECRET ?? "",
    options: {
      httpOnly: true,
      signed: true,
      path: process.env.COOKIE_PATH ?? "",
      maxAge: Number(process.env.COOKIE_EXP ?? 0),
      domain: process.env.COOKIE_DOMAIN ?? "",
      secure: process.env.SECURE_COOKIE === "true"
    }
  },
  db: process.env.DB ?? ""
} as const;
