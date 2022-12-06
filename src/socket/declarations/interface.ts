export interface User {
  id: string;
  username: string;
  game: string;
}

export interface Game {
  game: string;
  users: User[];
}
