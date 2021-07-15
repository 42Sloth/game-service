import { Socket } from "socket.io";
import { Game } from "../pong/pong";

export class User {

	public nickname: string;
	public client: Socket;

	constructor(nickname: string, client: Socket) {
		this.nickname = nickname;
		this.client = client;
	}

}
