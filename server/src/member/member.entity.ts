import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  nickname: string;

  @Column()
  default_image: string;

  @Column()
  role: string;

  @Column()
  ladder_score: number;
}
