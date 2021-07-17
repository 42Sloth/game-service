import { Socket } from "socket.io";
import { Game } from "../game/game";

export class User {

	public username: string;
	public client: Socket;

	constructor(username: string, client: Socket) {
		this.username = username;
		this.client = client;
	}

}
