import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { Game, Paddle } from "../game/game";

@Entity()
export class GameResult extends BaseEntity{
	constructor(game: Game){
		super();
		if (game) {
			this.playerLeft = game.players[0].username;
			this.playerRight = game.players[1].username;
			this.playerLeftScore = game.players[0].score;
			this.playerRightScore = game.players[1].score;
			this.winner = this.playerLeftScore > this.playerRightScore ? this.playerLeft : this.playerRight;
			this.startAt = game.startAt;
			this.endAt = game.endAt;
			this.playTime = Math.floor((game.endAt.getTime() - game.startAt.getTime()) / 1000);
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

	@Column({nullable: false, name: "player_left_score"})
	playerLeftScore: number;

	@Column({nullable: false, name: "player_right_score"})
	playerRightScore: number;

	@Column({nullable: false, name: "start_at"})
	startAt: Date;

	@Column({nullable: false, name: "end_at"})
	endAt: Date;

	@Column({nullable: false, name: "play_time"})
	playTime: number;
}
