import { EntityRepository } from "typeorm";
import { GameResult } from "../entity/GameResult.entity";

export class GameStatResponseDto {
	id: number;
	playerLeft: string;
	playerRight: string;
	winner: string;
	playerLeftScore: number;
	playerRightScore: number;
	playTime: number;


	public static fromEntity(entity: GameResult) : GameStatResponseDto {
		return {
			id: entity.id,
			playerLeft: entity.playerLeft,
			playerRight: entity.playerRight,
			playerLeftScore: entity.playerLeftScore,
			playerRightScore: entity.playerRightScore,
			winner: entity.winner,
			playTime: entity.playTime
		}
	}

}
