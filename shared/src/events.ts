/** Socket.IO event-name constants, shared by client and server so names can never drift/typo. */
export const ClientEvents = {
  HostCreateRoom: 'host:createRoom',
  HostReconnect: 'host:reconnect',
  PlayerJoinRoom: 'player:joinRoom',
  PlayerReconnect: 'player:reconnect',
  HostUpdatePromptSelection: 'host:updatePromptSelection',
  HostUpdateTimerConfig: 'host:updateTimerConfig',
  HostStartGame: 'host:startGame',
  PlayerSubmitAnswer: 'player:submitAnswer',
  HostForceCloseRound: 'host:forceCloseRound',
  HostNextRound: 'host:nextRound',
  HostEndGame: 'host:endGame',
  PlayerLeaveRoom: 'player:leaveRoom',
} as const;

export const ServerEvents = {
  RoomHostState: 'room:hostState',
  RoomPlayerState: 'room:playerState',
  RoomPlayerJoined: 'room:playerJoined',
  RoomPlayerLeft: 'room:playerLeft',
  RoomPlayerDisconnected: 'room:playerDisconnected',
  RoomPlayerReconnected: 'room:playerReconnected',
  RoundStarted: 'round:started',
  RoundAnswerReceived: 'round:answerReceived',
  RoundReveal: 'round:reveal',
  GameOver: 'game:over',
  ActionError: 'actionError',
} as const;
