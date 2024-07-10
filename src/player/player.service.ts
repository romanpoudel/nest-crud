import { Injectable } from '@nestjs/common';
import { PlayerDto, SpinDto } from './dto/player.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { SymbolType } from './types/player.types';

export const symbols: string[] = [
  'Cherry',
  '7',
  'BAR',
  '2xBAR',
  '3xBAR',
] as const;

@Injectable()
export class PlayerService {
  private readonly spinResult: SymbolType[][] = [[], [], []];
  constructor(private prisma: PrismaService) {}

  static getRandomFruit() {
    return symbols[Math.floor(Math.random() * symbols.length)];
  }

  async createPlayer(dto: PlayerDto) {
    try {
      const player = await this.prisma.player.create({
        data: {
          email: dto.email,
          username: dto.username,
        },
      });

      return player;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return 'credentials taken';
        }
      }
    }
    return 'create player';
  }

  async createGame() {
    const game = await this.prisma.game.create({
      data: {
        name: 'slot',
      },
    });
    return game;
  }

  async spin(dto: SpinDto): Promise<{ data: SymbolType[][] }> {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        this.spinResult[i][j] = PlayerService.getRandomFruit();
      }
    }

    //save spin details to spin table
    await this.prisma.spin.create({
      data: {
        bet_amount: dto.bet_amount,
        result_amount: 22,
        result: this.spinResult,
        player: { connect: { id: 1 } },
        game: { connect: { id: 1 } },
      },
    });
    return { data: this.spinResult };
  }
}
