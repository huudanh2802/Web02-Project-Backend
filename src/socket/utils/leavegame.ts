import { User } from "@src/socket/declarations/interface";

const leaveGame = (user: string, gameUsers: any) => {
  return gameUsers.filter((u: any) => u.id !== user);
};

export default leaveGame;
