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

export const payTable: {
  combinationOf3: { [key: string]: number[] };
  onlyThisSlotsCombination: [string[], number][];
} = {
  combinationOf3: {
    Cherry: [4000, 1000, 2000],
    '7': [150, 150, 150],
    BAR: [10, 10, 10],
    '2xBAR': [20, 20, 20],
    '3xBAR': [50, 50, 50],
  },
  onlyThisSlotsCombination: [
    [['Cherry', '7'], 75],
    [['BAR', '2xBAR', '3xBAR'], 5],
  ],
};

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

  static calculateWinAmount(result: SymbolType[][]) {
    let winAmount = 0;
    const shuffledResult: SymbolType[][] = [[], [], []];
    result.forEach((row, i) => {
      shuffledResult[0][i] = row[2];
      shuffledResult[1][i] = row[1];
      shuffledResult[2][i] = row[0];
    });
    //now check for win amount
    shuffledResult.forEach((row, i) => {
      if (row[0] === row[1] && row[1] === row[2]) {
        winAmount += payTable.combinationOf3[row[0]][i];
      } else {
        payTable.onlyThisSlotsCombination.forEach((combination, j) => {
          let win = true;

          if (combination[0].indexOf(row[0]) == -1) win = false;
          if (combination[0].indexOf(row[1]) == -1) win = false;
          if (combination[0].indexOf(row[2]) == -1) win = false;

          if (win) {
            winAmount += payTable.onlyThisSlotsCombination[j][1];
          }
        });
      }
    });
    return winAmount;
  }

  private async checkBalance() {
    return await this.prisma.player.findUnique({
      where: { id: 1 },
      select: { amount: true },
    });
  }

  async spin(dto: SpinDto) {
    //check if user has enough amount to bet
    const playerBalance = await this.checkBalance();
    if (Number(playerBalance?.amount) < dto.bet_amount) {
      return { error: 'insufficient balance' };
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        this.spinResult[i][j] = PlayerService.getRandomFruit();
      }
    }

    //calculate win amount
    const winAmount: number = PlayerService.calculateWinAmount(this.spinResult);

    //save spin details to spin table
    const result = await this.prisma.$transaction(async (prisma) => {
      //spin result
      const spinResult = await prisma.spin.create({
        data: {
          bet_amount: dto.bet_amount,
          result_amount: winAmount,
          result: this.spinResult,
          player: { connect: { id: 1 } },
          game: { connect: { id: 1 } },
        },
      });

      await prisma.player.update({
        where: { id: 1 },
        data: {
          amount: {
            decrement: spinResult.bet_amount,
          },
        },
      });
      const player = await prisma.player.update({
        where: { id: 1 },
        data: {
          amount: {
            increment: spinResult.result_amount,
          },
        },
      });

      return { spinResult, player };
    });

    return result;
  }
}
