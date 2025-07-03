import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Headers,
  BadRequestException,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { Recommendation } from './entities/recommendation.entity';
import { Product } from '../product/entities/product.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../user/auth/strategies/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profile/entities/profile.entity';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(
    private readonly recommendationService: RecommendationService,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  /**
   * Méthode utilitaire pour récupérer le profil à partir de l'userId
   */
  private async getProfileByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return profile;
  }

  @Post('profile/purchase-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePurchaseHistory(
    @Headers('content-type') contentType: string,
    @Body() rawBody: any,
    @Req() req
  ): Promise<void> {
    const userId = req.user.id;
    const profile = await this.getProfileByUserId(userId);
    const profileId = profile.id;
    
    const articleId = this.recommendationService.extractArticleId(rawBody, contentType);
    if (!articleId) {
      throw new BadRequestException('articleId is required');
    }
    
    await this.recommendationService.updatePurchaseHistory(profileId, articleId);
  }

  @Get('recommended')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  async getRecommendedProducts(@Req() req): Promise<Product[]> {
    const userId = req.user.id;
    const profile = await this.getProfileByUserId(userId);
    const profileId = profile.id;
    
    return this.recommendationService.getCombinedRecommendedProducts(profileId);
  }

  @Get('global')
  async getGlobalRecommendations(): Promise<Product[]> {
    return this.recommendationService.GetRecommendedProductGlobal();
  }

  @Get('global/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  async getGlobalRecommendationsMe(@Req() req): Promise<(Product & { isFavoris: boolean })[]> {
    const userId = req.user.id;
    return this.recommendationService.getGlobalRecommendationsWithFavorisByUserId(userId);
  }
}