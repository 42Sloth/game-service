import { EntityRepository } from "typeorm";
import { GameResult } from "../entity/GameResult.entity";

export class GameStatResponseDto {
	id: number;
	playerLeft: string;
	playerRight: string;
	winner: string;
	timer: number;
	playerLeftScore: number;
	playerRightScore: number;

	public static fromEntity(entity: GameResult) : GameStatResponseDto {
		return {
			id: entity.id,
			playerLeft: entity.playerLeft,
			playerRight: entity.playerRight,
			playerLeftScore: entity.playerLeftScore,
			playerRightScore: entity.playerRightScore,
			winner: entity.winner,
			timer: entity.timer
		}
	}

}
