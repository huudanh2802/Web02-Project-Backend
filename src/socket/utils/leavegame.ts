import { User } from "@src/socket/declarations/interface";

export const leaveGame = (user: string, gameUsers: User[]) => {
  return gameUsers.filter((u: User) => u.id !== user);
};

export const leaveGameCoHost = (user: string, gameCoHosts: User[]) => {
  return gameCoHosts.filter((u: User) => u.id !== user);
};
