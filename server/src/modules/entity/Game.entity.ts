import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class Game extends BaseEntity{
	@PrimaryGeneratedColumn({ name: "room_id"})
	roomId!: number;

	@Column({nullable: false, name: "user_name"})
	userName: string;

}
