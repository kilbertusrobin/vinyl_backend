import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Product } from './entities/product.entity';
import { Artist } from '../artist/entities/artist.entity';
import { Category } from '../category/entities/category.entity';
import { User } from '../user/entities/user.entity';
import { Profile } from '../profile/entities/profile.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { JwtStrategy } from '../user/auth/strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Artist, Category, User, Profile]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [ProductService, JwtStrategy],
  controllers: [ProductController],
})
export class ProductModule {}
