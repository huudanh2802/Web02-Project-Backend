export interface User {
  id: string;
  username: string;
  game: string;
}

export interface Game {
  game: string;
  presentation: string;
  users: User[];
  cohosts: User[];
  group: string | null;
}

export interface Group {
  id: string;
  name: string;
  createdAt: Date;
}
