import { Controller, Get } from '@nestjs/common';
import { SpinResultService } from './spin-result.service';

@Controller('spin-result')
export class SpinResultController {
  constructor(private spinResultService: SpinResultService) {}
  @Get()
  async getSpinResult() {
    return this.spinResultService.getSpinResult();
  }
}
