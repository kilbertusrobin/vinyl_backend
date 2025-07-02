import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './routes/user/user.module';
import { AuthModule } from './routes/user/auth/auth.module';
import { StripeModule } from './stripe/stripe.module';
import { MailModule } from './mail/mail.module';
import { ProfileModule } from './routes/profile/profile.module';
import { ProductModule } from './routes/product/product.module';
import { OrderModule } from './routes/order/order.module';
import { FavorisModule } from './routes/favoris/favoris.module';
import { DeliveryModule } from './routes/delivery/delivery.module';
import { CategoryModule } from './routes/category/category.module';
import { ArtistModule } from './routes/artist/artist.module';
import { RecommendationModule } from './routes/recommendation/recommendation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UserModule,
    AuthModule,
    StripeModule,
    MailModule,
    ProfileModule,
    ProductModule,
    RecommendationModule,
    OrderModule,
    FavorisModule,
    DeliveryModule,
    CategoryModule,
    ArtistModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}