import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class PlayerDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;
}

export class SpinDto {
  @IsNotEmpty()
  @IsInt()
  bet_amount: number;
}
