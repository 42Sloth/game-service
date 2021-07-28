import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Member{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  nickname: string;

  @Column()
  default_image: string;

  @Column()
  role: string;
}