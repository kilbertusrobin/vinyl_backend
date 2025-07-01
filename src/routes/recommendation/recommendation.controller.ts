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
} from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { Recommendation } from './entities/recommendation.entity';
import { Product } from './entities/product.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post()
  create(@Body() createRecommendationDto: Partial<Recommendation>): Promise<Recommendation> {
    return this.recommendationService.create(createRecommendationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recommendations' })
  findAll(): Promise<Recommendation[]> {
    return this.recommendationService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Recommendation ID' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Recommendation> {
    return this.recommendationService.findOne(id);
  }

  @Get('profile/:profileId')
  @ApiParam({ name: 'profileId', description: 'Profile ID' })
  getRecommendationByProfile(
    @Param('profileId', ParseIntPipe) profileId: number
  ): Promise<Recommendation> {
    return this.recommendationService.getRecommendationByProfile(profileId);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'Recommendation ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecommendationDto: Partial<Recommendation>,
  ): Promise<Recommendation> {
    return this.recommendationService.update(id, updateRecommendationDto);
  }

  @Patch('profile/:profileId')
  @ApiParam({ name: 'profileId', description: 'Profile ID' })
  updateRecommendationByProfile(
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() updateRecommendationDto: Partial<Recommendation>,
  ): Promise<Recommendation> {
    return this.recommendationService.updateRecommendationByProfile(profileId, updateRecommendationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Recommendation ID' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.recommendationService.remove(id);
  }

  @Post('profile/:profileId')

  @ApiParam({ name: 'profileId', description: 'Profile ID' })
  upsertRecommendationForProfile(
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() recommendationData: Partial<Recommendation>,
  ): Promise<Recommendation> {
    return this.recommendationService.upsertRecommendationForProfile(profileId, recommendationData);
  }

  @Post('profile/:profileId/purchase-history')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'profileId', description: 'Profile ID' })
  async updatePurchaseHistory(
    @Param('profileId', ParseIntPipe) profileId: number,
    @Headers('content-type') contentType: string,
    @Body() rawBody: any
  ): Promise<void> {
    const articleId = this.extractArticleId(rawBody, contentType);
    if (!articleId) {
      throw new BadRequestException('articleId is required');
    }
    await this.recommendationService.updatePurchaseHistory(profileId, articleId);
  }

  @Get('recommended-from-fav/:profileId')
  @ApiParam({ name: 'profileId', description: 'Profile ID' })
  async getRecommendedProducts(
    @Param('profileId', ParseIntPipe) profileId: number
  ): Promise<Product[]> {
    return this.recommendationService.getRecommendedProducts(profileId);
  }

  @Get('recommended-from-history/:profileId')
  @ApiParam({ name: 'profileId', description: 'Profile ID' })
  async getRecommendedProductsFromHistory(
    @Param('profileId', ParseIntPipe) profileId: number
  ): Promise<Product[]> {
    return this.recommendationService.getRecommendedProductsFromHistory(profileId);
  }

  @Get('recommended/:profileId')
  @ApiParam({ name: 'profileId', description: 'Profile ID' })
  async getRecommendedProducts(
    @Param('profileId', ParseIntPipe) profileId: number
  ): Promise<Product[]> {
    return this.recommendationService.getCombinedRecommendedProducts(profileId);
  }


  @Get('global')
  async getGlobalRecommendations(): Promise<Product[]> {
    return this.recommendationService.GetRecommendedProductGlobal();
  }




  /**
   * Extrait l'articleId du body de la requête selon le content-type
   */
  private extractArticleId(rawBody: any, contentType: string): string | null {
    let data;

    if (contentType === 'text/plain') {
      try {
        data = JSON.parse(rawBody);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return null;
      }
    } else {
      data = rawBody;
    }

    return data?.articleId || null;
  }
}