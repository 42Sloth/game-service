import { IsNumber, IsString } from 'class-validator';
import { Member } from 'src/member/member.entity';

export class MemberDto {
  @IsString()
  readonly username: string;

  @IsString()
  readonly nickname: string;

  @IsString()
  readonly default_image: string;

  @IsString()
  readonly role: string;

  @IsNumber()
  readonly ladder_score: number;

  public static fromEntity(entity: Member): MemberDto {
    return {
      username: entity.username,
      nickname: entity.nickname,
      default_image: entity.default_image,
      role: entity.role,
      ladder_score: entity.ladder_score,
    };
  }
}
