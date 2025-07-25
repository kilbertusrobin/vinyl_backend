import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favoris } from './entities/favoris.entity';
import { Profile } from '../profile/entities/profile.entity';
import { Product } from '../product/entities/product.entity';
import { FavorisController } from './favoris.controller';
import { FavorisService } from './favoris.service';

@Module({
  imports: [TypeOrmModule.forFeature([Favoris, Profile, Product])],
  controllers: [FavorisController],
  providers: [FavorisService],
})
export class FavorisModule {}
