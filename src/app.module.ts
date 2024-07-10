import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PlayerModule } from './player/player.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaModule } from './prisma/prisma.module';
import { SpinResultModule } from './spin-result/spin-result.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PlayerModule,
    BookmarkModule,
    PrismaModule,
    SpinResultModule,
  ],
})
export class AppModule {}
