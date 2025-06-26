import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favoris } from './entities/favoris.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favoris])],
})
export class FavorisModule {}
