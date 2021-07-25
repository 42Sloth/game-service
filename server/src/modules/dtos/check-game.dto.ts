import { IsEnum, IsString } from 'class-validator';
import { GameModeEnum } from '../game/submodule/enums';

export class CheckGameDto {
  @IsString()
  readonly roomId: string;

  @IsEnum(GameModeEnum)
  readonly mode: GameModeEnum;

  @IsString()
  readonly password: string;
}
