import { GameResult } from '../entity/game-result.entity';

export class GetGameResultDto {
  id: number;
  playerLeft: string;
  playerRight: string;
  winner: string;
  playerLeftScore: number;
  playerRightScore: number;
  playTime: number;

  public static fromEntity(entity: GameResult): GetGameResultDto {
    return {
      id: entity.id,
      playerLeft: entity.playerLeft,
      playerRight: entity.playerRight,
      playerLeftScore: entity.playerLeftScore,
      playerRightScore: entity.playerRightScore,
      winner: entity.winner,
      playTime: entity.playTime,
    };
  }
}
