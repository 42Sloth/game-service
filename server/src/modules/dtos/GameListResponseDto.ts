export class GameListResponseDto {
	roomId: string;
	leftPlayer: string;
	rightPlayer: string;
	type: string;

	constructor(roomId: string, leftPlayer: string, rightPlayer: string, type: string){
		this.roomId = roomId;
		this.leftPlayer = leftPlayer;
		this.rightPlayer = rightPlayer;
		this.type = type;
	}
}
