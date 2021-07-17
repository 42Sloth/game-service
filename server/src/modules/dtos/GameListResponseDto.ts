export class GameListResponseDto {
	roomId: string;
	leftPlayer: string;
	rightPlayer: string;

	constructor(roomId: string, leftPlayer: string, rightPlayer: string){
		this.roomId = roomId;
		this.leftPlayer = leftPlayer;
		this.rightPlayer = rightPlayer;
	}
}
