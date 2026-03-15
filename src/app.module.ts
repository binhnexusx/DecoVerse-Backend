import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { ProjectsModule } from './projects/projects.module';
import { ModelsModule } from './models/models.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    AiModule,
    ProjectsModule,
    ModelsModule,
  ],
})
export class AppModule {}
