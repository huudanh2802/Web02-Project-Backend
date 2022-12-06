export interface User {
  id: string;
  username: string;
  game: string;
}

export interface Game {
  game: string;
  presentation: string;
  users: User[];
  locked: boolean;
}
