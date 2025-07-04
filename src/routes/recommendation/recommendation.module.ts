import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { Favoris } from '../favoris/entities/favoris.entity';
import { Product } from '../product/entities/product.entity';
import { Profile } from '../profile/entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recommendation, Favoris, Product, Profile])],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}
