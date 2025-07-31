// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TweetModule } from './tweet/tweet.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from './profile/profile.module';
import { HashtagModule } from './hashtag/hashtag.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaginationModule } from './common/pagination/pagination.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import envValidator from './config/env.validation';
import { APP_GUARD } from '@nestjs/core';
import { AuthorizeGuard } from 'src/auth/guards/authorize.guard';
import { JwtModule } from '@nestjs/jwt';

// SỬA LỖI: Import authConfig từ đúng đường dẫn của nó
import authConfig from './auth/config/auth.config'; 
// KHÔNG import User ở đây, TypeORM sẽ tự xử lý thông qua autoLoadEntities
// import { User } from './users/user.entity'; 

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV.trim()}`,
      // SỬA LỖI: Thêm authConfig vào mảng load
      load: [appConfig, databaseConfig, authConfig], 
      validationSchema: envValidator
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // TỐI ƯU: Không cần liệt kê entities ở đây nếu đã dùng autoLoadEntities
        // entities: [User], 
        autoLoadEntities: configService.get<boolean>('database.autoLoadEntities'),
        synchronize: configService.get<boolean>('database.synchronize'),
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name')
      })
    }),
    // TỐI ƯU HÓA: Đăng ký JwtModule một cách hiện đại và rõ ràng hơn
    JwtModule.registerAsync({
      imports: [ConfigModule], // Đảm bảo module này có thể truy cập ConfigService
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.secret'),
        signOptions: {
          expiresIn: configService.get<number>('auth.expiresIn'),
          audience: configService.get<string>('auth.audience'),
          issuer: configService.get<string>('auth.issuer'),
        },
      }),
    }),
    UsersModule,
    TweetModule,
    AuthModule,
    ProfileModule,
    HashtagModule,
    PaginationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    {
      provide: APP_GUARD,
      useClass: AuthorizeGuard
    }
  ],
})
export class AppModule {}