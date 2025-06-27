import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Artist } from '../artist/entities/artist.entity';
import { Category } from '../category/entities/category.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Artist, Category])],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
