import "./pre-start"; // Must be the first import

import EnvVars from "@src/declarations/major/EnvVars";
import mongoose from "mongoose";
import server from "./server";

// **** Start server **** //

// const msg = `Express server started on port: ${EnvVars.port.toString()}`;

mongoose.connect(EnvVars.db).then(() => {
  // console.log("connect success");
  server.listen(EnvVars.port);
});
