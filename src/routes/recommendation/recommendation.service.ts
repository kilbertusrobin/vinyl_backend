import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { Favoris, TargetType } from './entities/favoris.entity';
import { Product } from './entities/product.entity';

interface HistoryBasedPreferences {
  mostFrequentCategory: string;
  mostFrequentArtist: string;
}

@Injectable()
export class RecommendationService {
  private static readonly MAX_HISTORY_SIZE = 10;
  private static readonly MAX_RECOMMENDED_PRODUCTS = 10;

  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,
    @InjectRepository(Favoris)
    private readonly favorisRepository: Repository<Favoris>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Crée une nouvelle recommandation
   */
  async create(createRecommendationDto: Partial<Recommendation>): Promise<Recommendation> {
    const newRecommendation = this.recommendationRepository.create(createRecommendationDto);
    return await this.recommendationRepository.save(newRecommendation);
  }

  /**
   * Récupère toutes les recommandations
   */
  async findAll(): Promise<Recommendation[]> {
    return await this.recommendationRepository.find({
      relations: ['profile'],
    });
  }

  /**
   * Récupère une recommandation par ID
   */
  async findOne(id: number): Promise<Recommendation> {
    const recommendation = await this.recommendationRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!recommendation) {
      throw new NotFoundException(`Recommendation with ID ${id} not found`);
    }

    return recommendation;
  }

  /**
   * Récupère une recommandation par ID de profil
   */
  async getRecommendationByProfile(profileId: number): Promise<Recommendation | null> {
    return await this.recommendationRepository.findOne({
      where: { profile: { id: profileId } },
      relations: ['profile'],
    });
  }

  /**
   * Met à jour une recommandation
   */
  async update(id: number, updateRecommendationDto: Partial<Recommendation>): Promise<Recommendation> {
    const existingRecommendation = await this.findOne(id);
    Object.assign(existingRecommendation, updateRecommendationDto);
    return await this.recommendationRepository.save(existingRecommendation);
  }

  /**
   * Met à jour une recommandation par ID de profil
   */
  async updateRecommendationByProfile(
    profileId: number,
    updateRecommendationDto: Partial<Recommendation>
  ): Promise<Recommendation> {
    const existingRecommendation = await this.getRecommendationByProfile(profileId);

    if (!existingRecommendation) {
      throw new NotFoundException(`No recommendation found for profile ID ${profileId}`);
    }

    Object.assign(existingRecommendation, updateRecommendationDto);
    return await this.recommendationRepository.save(existingRecommendation);
  }

  /**
   * Supprime une recommandation
   */
  async remove(id: number): Promise<void> {
    const recommendation = await this.findOne(id);
    await this.recommendationRepository.remove(recommendation);
  }

  /**
   * Crée ou met à jour une recommandation pour un profil (upsert)
   */
  async upsertRecommendationForProfile(
    profileId: number,
    recommendationData: Partial<Recommendation>
  ): Promise<Recommendation> {
    const existingRecommendation = await this.getRecommendationByProfile(profileId);

    if (existingRecommendation) {
      // Mise à jour
      Object.assign(existingRecommendation, recommendationData);
      return await this.recommendationRepository.save(existingRecommendation);
    } else {
      // Création
      const newRecommendation = this.recommendationRepository.create({
        ...recommendationData,
        profile: { id: profileId } as any,
      });
      return await this.recommendationRepository.save(newRecommendation);
    }
  }

  /**
   * Met à jour l'historique d'achat d'un profil
   */
  async updatePurchaseHistory(profileId: number, articleId: string): Promise<void> {
    const existingRecommendation = await this.getRecommendationByProfile(profileId);

    const historyList = this.updateHistoryList(
      existingRecommendation?.historicAchat || '',
      articleId
    );

    const recommendationData: Partial<Recommendation> = {
      historicAchat: historyList.join(','),
      productFav: articleId,
    };

    await this.upsertRecommendationForProfile(profileId, recommendationData);
  }

  /**
   * Récupère les produits recommandés pour un profil
   */
  async getRecommendedProducts(profileId: number): Promise<Product[]> {
    let recommendation = await this.getRecommendationByProfile(profileId);

    if (!recommendation) {
      recommendation = await this.calculateAndUpsertRecommendation(profileId);
    }

    const recommendedProducts = await this.findSimilarProducts(recommendation);
    return recommendedProducts.slice(0, RecommendationService.MAX_RECOMMENDED_PRODUCTS);
  }

  /**
   * Récupère les produits recommandés basés sur l'historique d'achat
   */
  async getRecommendedProductsFromHistory(profileId: number): Promise<Product[]> {
    let recommendation = await this.getRecommendationByProfile(profileId);

    if (!recommendation) {
      recommendation = await this.calculateAndUpsertRecommendation(profileId);
    }

    if (!recommendation.historicAchat) {
      return [];
    }

    const historyBasedPreferences = await this.calculateHistoryBasedPreferences(
      recommendation.historicAchat
    );

    const recommendedProducts = await this.findSimilarProductsFromHistory(
      historyBasedPreferences,
      recommendation.historicAchat
    );

    return recommendedProducts.slice(0, RecommendationService.MAX_RECOMMENDED_PRODUCTS);
  }




  /**
   * Récupère les produits recommandés pour un profil, en combinant recommandations classiques et historiques
   */
  async getCombinedRecommendedProducts(profileId: number): Promise<Product[]> {
    let recommendation = await this.getRecommendationByProfile(profileId);

    if (!recommendation) {
      recommendation = await this.calculateAndUpsertRecommendation(profileId);
    }

    // Recommandations classiques
    const classicRecommended = await this.findSimilarProducts(recommendation);

    // Recommandations basées sur l'historique
    let historyRecommended: Product[] = [];
    if (recommendation.historicAchat) {
      const historyBasedPreferences = await this.calculateHistoryBasedPreferences(
        recommendation.historicAchat
      );

      historyRecommended = await this.findSimilarProductsFromHistory(
        historyBasedPreferences,
        recommendation.historicAchat
      );
    }

    // Fusion sans doublons (en supposant que chaque produit a un id unique)
    const productMap = new Map<number, Product>();
    [...classicRecommended, ...historyRecommended].forEach((p) => {
      productMap.set(p.id, p);
    });

    const combined = Array.from(productMap.values());
    return combined.slice(0, RecommendationService.MAX_RECOMMENDED_PRODUCTS);
  }








  /**
   * Met à jour la liste d'historique en ajoutant un nouvel article
   */
  private updateHistoryList(currentHistory: string, newArticleId: string): string[] {
    let historyList: string[] = [];

    if (currentHistory && currentHistory.trim()) {
      historyList = currentHistory.split(',').map(id => id.trim()).filter(id => id);
      // Supprimer l'article s'il existe déjà pour éviter les doublons
      historyList = historyList.filter(id => id !== newArticleId);
    }
    historyList.unshift(newArticleId);

    if (historyList.length > RecommendationService.MAX_HISTORY_SIZE) {
      historyList = historyList.slice(0, RecommendationService.MAX_HISTORY_SIZE);
    }
    return historyList;
  }


/**
 * Retourne les produits globalement les plus recommandés (selon le champ productFav de toutes les recommandations)
 */
private async GetRecommendedProductGlobal(): Promise<Product[]> {
  const allRecommendations = await this.recommendationRepository.find();

  const productIdCount = new Map<string, number>();

  for (const rec of allRecommendations) {
    const productId = rec.productFav;
    if (!productId) continue;
    productIdCount.set(productId, (productIdCount.get(productId) || 0) + 1);
  }

  const topProductIds = Array.from(productIdCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, RecommendationService.MAX_RECOMMENDED_PRODUCTS)
    .map(([id]) => id);

  const topProducts = await this.productRepository.findBy({
    id: In(topProductIds)
  });

  const productMap = new Map(topProducts.map(p => [p.id.toString(), p]));
  return topProductIds.map(id => productMap.get(id)).filter(p => p !== undefined) as Product[];
}



  /**
   * Calcule et sauvegarde les recommandations basées sur les favoris
   */
  private async calculateAndUpsertRecommendation(profileId: number): Promise<Recommendation> {
    const favoris = await this.favorisRepository.find({
      where: { profile: { id: profileId } },
      relations: ['profile']
    });

    const artistFavoris = favoris.filter(fav => fav.targetType === TargetType.ARTIST);
    const productFavoris = favoris.filter(fav => fav.targetType === TargetType.PRODUCT);
    const artisteFav = this.calculateMostFrequentTarget(artistFavoris);
    const categoryFav = await this.calculateMostFrequentCategory(productFavoris);
    const recommendationData: Partial<Recommendation> = {
      categoryFav,
      artisteFav,
    };

    return await this.upsertRecommendationForProfile(profileId, recommendationData);
  }

  /**
   * Calcule l'élément le plus fréquent dans une liste de favoris
   */
  private calculateMostFrequentTarget(favoris: Favoris[]): string {
    if (favoris.length === 0) return '';

    const counts = favoris.reduce((acc, fav) => {
      acc[fav.targetId] = (acc[fav.targetId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  /**
   * Calcule la catégorie la plus fréquente à partir des produits favoris
   */
  private async calculateMostFrequentCategory(productFavoris: Favoris[]): Promise<string> {
    if (productFavoris.length === 0) return '';

    const products = await this.productRepository.find({
      where: { id: In(productFavoris.map(fav => fav.targetId)) },
      relations: ['categories']
    });

    const categoryCounts: Record<string, number> = {};
    products.forEach(product => {
      product.categories.forEach(category => {
        categoryCounts[category.id] = (categoryCounts[category.id] || 0) + 1;
      });
    });

    if (Object.keys(categoryCounts).length === 0) return '';

    return Object.keys(categoryCounts).reduce((a, b) =>
      categoryCounts[a] > categoryCounts[b] ? a : b
    );
  }

  /**
   * Trouve des produits similaires basés sur les recommandations
   */
  private async findSimilarProducts(recommendation: Recommendation): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.artists', 'artist')
      .leftJoinAndSelect('product.categories', 'category');

    const conditions: string[] = [];
    const parameters: any = {};

    if (recommendation.categoryFav) {
      conditions.push('category.id = :categoryFav');
      parameters.categoryFav = recommendation.categoryFav;
    }

    if (recommendation.artisteFav) {
      conditions.push('artist.id = :artisteFav');
      parameters.artisteFav = recommendation.artisteFav;
    }

    if (conditions.length > 0) {
      queryBuilder.where(`(${conditions.join(' OR ')})`, parameters);
    }

    this.excludeHistoryProducts(queryBuilder, recommendation.historicAchat);

    return await queryBuilder
      .orderBy('RAND()')
      .limit(RecommendationService.MAX_RECOMMENDED_PRODUCTS)
      .getMany();
  }

  /**
   * Calcule les préférences basées sur l'historique d'achat
   */
  private async calculateHistoryBasedPreferences(historicAchat: string): Promise<HistoryBasedPreferences> {
    const historicIds = this.parseHistoryIds(historicAchat);

    if (historicIds.length === 0) {
      return { mostFrequentCategory: '', mostFrequentArtist: '' };
    }

    const historicProducts = await this.productRepository.find({
      where: { id: In(historicIds) },
      relations: ['categories', 'artists']
    });

    const categoryCounts = this.countCategories(historicProducts);
    const artistCounts = this.countArtists(historicProducts);

    return {
      mostFrequentCategory: this.getMostFrequent(categoryCounts),
      mostFrequentArtist: this.getMostFrequent(artistCounts)
    };
  }

  /**
   * Trouve des produits similaires basés sur l'historique
   */
  private async findSimilarProductsFromHistory(
    preferences: HistoryBasedPreferences,
    historicAchat: string
  ): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.artists', 'artist')
      .leftJoinAndSelect('product.categories', 'category');

    const conditions: string[] = [];
    const parameters: any = {};

    if (preferences.mostFrequentCategory) {
      conditions.push('category.id = :mostFrequentCategory');
      parameters.mostFrequentCategory = preferences.mostFrequentCategory;
    }

    if (preferences.mostFrequentArtist) {
      conditions.push('artist.id = :mostFrequentArtist');
      parameters.mostFrequentArtist = preferences.mostFrequentArtist;
    }

    if (conditions.length > 0) {
      queryBuilder.where(`(${conditions.join(' OR ')})`, parameters);
    }

    this.excludeHistoryProducts(queryBuilder, historicAchat);

    return await queryBuilder
      .orderBy('RAND()')
      .limit(RecommendationService.MAX_RECOMMENDED_PRODUCTS)
      .getMany();
  }

  /**
   * Méthodes utilitaires
   */
  private parseHistoryIds(historicAchat: string): string[] {
    if (!historicAchat || historicAchat.trim() === '') return [];
    return historicAchat.split(',').map(id => id.trim()).filter(id => id);
  }

  private excludeHistoryProducts(queryBuilder: any, historicAchat: string): void {
    const historicIds = this.parseHistoryIds(historicAchat);
    if (historicIds.length > 0) {
      queryBuilder.andWhere('product.id NOT IN (:...historicIds)', { historicIds });
    }
  }

  private countCategories(products: Product[]): Record<string, number> {
    const counts: Record<string, number> = {};
    products.forEach(product => {
      product.categories.forEach(category => {
        counts[category.id] = (counts[category.id] || 0) + 1;
      });
    });
    return counts;
  }

  private countArtists(products: Product[]): Record<string, number> {
    const counts: Record<string, number> = {};
    products.forEach(product => {
      product.artists.forEach(artist => {
        counts[artist.id] = (counts[artist.id] || 0) + 1;
      });
    });
    return counts;
  }

  private getMostFrequent(counts: Record<string, number>): string {
    const keys = Object.keys(counts);
    if (keys.length === 0) return '';
    return keys.reduce((a, b) => counts[a] > counts[b] ? a : b);
  }
}