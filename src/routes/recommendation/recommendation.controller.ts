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
} from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { Recommendation } from './entities/recommendation.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendation.service: RecommendationService) {}

  @Post()
  create(@Body() Recommendation: Recommendation) {
    return this.recommendationService.create(Recommendation);
  }

  @Get()
  findAll() {
    return this.recommendationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.recommendationService.findOne(id);
  }

  @Get('profile/:profileId')
  getRecommendationByIdProfile(@Param('profileId', ParseIntPipe) profileId: string) {
    return this.recommendationService.getRecommendationByIdProfile(profileId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() recommendation: Recommendation,
  ) {
    return this.recommendationService.update(id, recommendation);
  }

  @Patch('profile/:profileId')
  updateRecommendationByProfileId(
    @Param('profileId', ParseIntPipe) profileId: string,
    @Body() recommendation: Recommendation,
  ) {
    return this.recommendationService.updateRecommendationByProfileId(profileId, recommendation);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.recommendationService.remove(id);
  }


  @Post('profile/:profileId/')
  upsertRecommendationForProfile(
    @Param('profileId', ParseIntPipe) profileId: string,
    @Body() recommendation: Recommendation,
  ) {
    return this.recommendationService.upsertRecommendationForProfile(profileId, recommendation);
  }


//le ProductID en body pour l'ajouter a l'historic d'achat
@Post('profile/time/:profileId')
@HttpCode(204)
async MajHistoricProfile(
  @Param('profileId') profileId: string,
  @Headers('content-type') contentType: string,
  @Body() rawBody: any
) {
  let data;

  if (contentType === 'text/plain') {
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      console.error('Erreur JSON:', e);
      return;
    }
  } else {
    data = rawBody;
  }

  const articleId = data?.articleId;
  if (!articleId) {
    console.error('articleId manquant dans la requête');
    return;
  }

  const existingRecommendation = await this.recommendationService.getRecommendationByIdProfile(profileId);

  let historyList: string[] = [];

  if (existingRecommendation?.historicAchat) {
    historyList = existingRecommendation.historicAchat.split(',');
    // Retirer l'article s’il est déjà présent pour éviter les doublons
    historyList = historyList.filter(id => id !== articleId);
  }

  // Ajouter le nouvel articleId au début
  historyList.unshift(articleId);

  // Limiter à 10 articles max
  if (historyList.length > 10) {
    historyList = historyList.slice(0, 10);
  }

  const updatedHistoric = historyList.join(',');

  const recommendation: Recommendation = {
    historicAchat: updatedHistoric,
    productFav: articleId,
  };

  await this.recommendationService.upsertRecommendationForProfile(profileId, recommendation);
}


//Retourne une liste d'idProduct (les Product Recommandé 10 products )
@Get('recommended/:profileId')
@ApiOperation({ summary: 'Get recommended products for a profile' })
@ApiParam({ name: 'profileId', description: 'Profile ID' })
async getRecommendedProducts(
  @Param('profileId', ParseIntPipe) profileId: string
) {
  return this.recommendationService.getRecommendedProducts(profileId);
}


//les Product Recommandé celon Historic d'achat (10 products)
@Get('recommended-from-history/:profileId')
@ApiOperation({ summary: 'Get recommended products based on purchase history' })
@ApiParam({ name: 'profileId', description: 'Profile ID' })
async getRecommendedProductsFromHistory(
  @Param('profileId') profileId: string
) {
  return this.recommendationService.getRecommendedProductsFromHistory(profileId);
}