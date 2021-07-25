import { IsEnum, IsString } from 'class-validator';
import { BallSizeEnum, GameSpeedEnum, GameTypeEnum } from '../game/submodule/enums';

export class CreateGameDto {
  @IsString()
  readonly username: string;

  @IsEnum(GameTypeEnum)
  readonly type: GameTypeEnum;

  @IsString()
  readonly password: string;

  @IsEnum(GameSpeedEnum)
  readonly speed: GameSpeedEnum;

  @IsEnum(BallSizeEnum)
  readonly ball: BallSizeEnum;

  @IsString()
  readonly mapColor: string;
}
