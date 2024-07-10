import { Body, Controller, Get, Post } from '@nestjs/common';
import { PlayerDto, SpinDto } from './dto/player.dto';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
  constructor(private playerService: PlayerService) {}

  @Post('create-player')
  createPlayer(@Body() dto: PlayerDto) {
    return this.playerService.createPlayer(dto);
  }

  @Post('spin')
  spin(@Body() dto: SpinDto) {
    return this.playerService.spin(dto);
  }

  @Get('create-game')
  createGame() {
    return this.playerService.createGame();
  }
}
