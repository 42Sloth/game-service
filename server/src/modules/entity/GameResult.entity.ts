import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { Game, Paddle } from "../game/game";

@Entity()
export class GameResult extends BaseEntity{
	constructor(game: Game){
		super();
		if (game) {
			this.playerLeft = game.players[0].username;
			this.playerRight = game.players[1].username;
			this.winner = game.players[0].username;
			this.timer = 1;
			this.playerLeftScore = game.players[0].score;
			this.playerRightScore = game.players[1].score;
		}
	}

	@PrimaryGeneratedColumn("increment")
	id: number;

	@Column({nullable: false, name: "player_left"})
	playerLeft: string;

	@Column({nullable: false, name: "player_right"})
	playerRight: string;

	@Column({nullable: false, name: "winner"})
	winner: string;

	@Column({nullable: false, name: "timer"})
	timer: number;

	@Column({nullable: false, name: "player_left_score"})
	playerLeftScore: number;

	@Column({nullable: false, name: "player_right_score"})
	playerRightScore: number;
}
