import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from './entities/recommendation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recommendation])],
})
export class RecommendationModule {}
