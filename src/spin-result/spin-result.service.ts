import { Injectable } from '@nestjs/common';

const symbols: string[] = ['Cherry', '7', 'BAR', '2xBAR', '3xBAR'] as const;

type SymbolType = (typeof symbols)[number];

@Injectable()
export class SpinResultService {
  private readonly spinResult: SymbolType[][] = [[], [], [], []];

  static getRandomFruit() {
    return symbols[Math.floor(Math.random() * symbols.length)];
  }

  getSpinResult(): { data: SymbolType[][] } {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        this.spinResult[i][j] = SpinResultService.getRandomFruit();
      }
    }
    return { data: this.spinResult };
  }
}
