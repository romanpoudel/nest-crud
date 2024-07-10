import { Module } from '@nestjs/common';
import { SpinResultService } from './spin-result.service';
import { SpinResultController } from './spin-result.controller';

@Module({
  providers: [SpinResultService],
  controllers: [SpinResultController],
})
export class SpinResultModule {}
