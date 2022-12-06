import { User } from "@src/socket/declarations/interface";

const leaveGame = (user: string, gameUsers: User[]) => {
  return gameUsers.filter((u: User) => u.id !== user);
};

export default leaveGame;
