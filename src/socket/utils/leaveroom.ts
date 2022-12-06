const leaveRoom = (user: any, gameUsers: any) => {
  return gameUsers.filter((u: any) => u.id !== user);
};

export default leaveRoom;
