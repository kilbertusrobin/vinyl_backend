import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { Favoris } from '../favoris/entities/favoris.entity';
import { Product } from '../product/entities/product.entity';
import { Profile } from '../profile/entities/profile.entity';

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
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
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
  async findOne(id: string): Promise<Recommendation> {
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
   * Récupère une recommandation par ID de profil si null renvoie un new avec les favoris mis a jour
   */
  async getRecommendationByProfile(profileId: string): Promise<Recommendation> {
    const existing = await this.recommendationRepository.findOne({
      where: { profile: { id: profileId } },
      relations: ['profile'],
    });

    if (existing) return existing;

    // Crée une instance vide avec le profil associé
    let recommendation = new Recommendation();
    recommendation.profile = { id: profileId } as any; // ou récupère l'entité complète si besoin
    recommendation = await this.calculateAndUpsertRecommendation(Number(profileId))
    return recommendation;
  }

  /**
   * Met à jour une recommandation
   */
  async update(id: string, updateRecommendationDto: Partial<Recommendation>): Promise<Recommendation> {
    const existingRecommendation = await this.findOne(id);
    Object.assign(existingRecommendation, updateRecommendationDto);
    return await this.recommendationRepository.save(existingRecommendation);
  }

  /**
   * Met à jour une recommandation par ID de profil
   */
  async updateRecommendationByProfile(
    profileId: string,
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
  async remove(id: string): Promise<void> {
    const recommendation = await this.findOne(id);
    await this.recommendationRepository.remove(recommendation);
  }

  /**
   * Crée ou met à jour une recommandation pour un profil (upsert)
   */
  async upsertRecommendationForProfile(
    profileId: string,
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
  async updatePurchaseHistory(profileId: string, articleId: string): Promise<void> {
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
  async getRecommendedProducts(profileId: string): Promise<Product[]> {
    let recommendation = await this.getRecommendationByProfile(profileId);

    if (!recommendation) {
      recommendation = await this.calculateAndUpsertRecommendation(Number(profileId));
    }

    const recommendedProducts = await this.findSimilarProducts(recommendation);
    return recommendedProducts.slice(0, RecommendationService.MAX_RECOMMENDED_PRODUCTS);
  }


  async getRecommendedProductsFromHistory(profileId: string): Promise<Product[]> {
    let recommendation = await this.getRecommendationByProfile(profileId);

    if (!recommendation) {
      recommendation = await this.calculateAndUpsertRecommendation(Number(profileId));
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
   * AVEC FALLBACK - Complète avec des produits aléatoires si moins de 10 produits
   */
  async getCombinedRecommendedProducts(profileId: string): Promise<Product[]> {
    let recommendation = await this.getRecommendationByProfile(profileId);

    if (!recommendation) {
      recommendation = await this.calculateAndUpsertRecommendation(Number(profileId));
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
    const productMap = new Map<string, Product>();
    [...classicRecommended, ...historyRecommended].forEach((p) => {
      productMap.set(String(p.id), p);
    });

    let combined = Array.from(productMap.values());

    // FALLBACK: Compléter avec des produits aléatoires si moins de MAX_RECOMMENDED_PRODUCTS
    if (combined.length < RecommendationService.MAX_RECOMMENDED_PRODUCTS) {
      const excludedIds = combined.map(p =>  p.id.toString());
      const additionalProducts = await this.getRandomProducts(
        RecommendationService.MAX_RECOMMENDED_PRODUCTS - combined.length,
        excludedIds,
        recommendation.historicAchat
      );
      combined = [...combined, ...additionalProducts];
    }

    return combined.slice(0, RecommendationService.MAX_RECOMMENDED_PRODUCTS);
  }

  /**
   * Retourne les produits globalement les plus recommandés (selon le champ productFav de toutes les recommandations)
   * AVEC FALLBACK - Complète avec des produits aléatoires si moins de 10 produits
   */
  public async GetRecommendedProductGlobal(): Promise<Product[]> {
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

    const productMap = new Map<string, Product>(
      topProducts.map(p => [String(p.id), p])
    );
    let finalProducts = topProductIds.map(id => productMap.get(id)).filter(p => p !== undefined) as Product[];

    // FALLBACK: Compléter avec des produits aléatoires si moins de MAX_RECOMMENDED_PRODUCTS
    if (finalProducts.length < RecommendationService.MAX_RECOMMENDED_PRODUCTS) {
      const excludedIds = finalProducts.map(p => p.id.toString());
      const additionalProducts = await this.getRandomProducts(
        RecommendationService.MAX_RECOMMENDED_PRODUCTS - finalProducts.length,
        excludedIds
      );
      finalProducts = [...finalProducts, ...additionalProducts];
    }

    return finalProducts.slice(0, RecommendationService.MAX_RECOMMENDED_PRODUCTS);
  }

  /**
   * Retourne les produits globaux recommandés avec le statut isFavoris pour un profil donné
   */
  public async getGlobalRecommendationsWithFavoris(profileId: string): Promise<(Product & { isFavoris: boolean })[]> {
    const products = await this.GetRecommendedProductGlobal();
    // Récupérer tous les favoris actifs de ce profil
    const favoris = await this.favorisRepository.find({
      where: { profile: { id: profileId }, isFavoris: true },
      relations: ['product']
    });
    const favorisProductIds = new Set(favoris.map(f => f.product.id));
    // Ajouter le champ isFavoris à chaque produit
    return products.map(product => ({
      ...product,
      isFavoris: favorisProductIds.has(product.id)
    }));
  }

  /**
   * Retourne les produits globaux recommandés avec isFavoris à partir de l'id utilisateur
   */
  public async getGlobalRecommendationsWithFavorisByUserId(userId: string): Promise<(Product & { isFavoris: boolean })[]> {
    const profile = await this.profileRepository.findOne({ where: { user: { id: userId } } });
    if (!profile) throw new NotFoundException('Profil non trouvé pour cet utilisateur');
    return this.getGlobalRecommendationsWithFavoris(profile.id);
  }

  /**
   * NOUVELLE MÉTHODE: Récupère des produits aléatoires pour compléter les recommandations
   */
  private async getRandomProducts(
    count: number,
    excludedIds: string[] = [],
    historicAchat?: string
  ): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Exclure les produits déjà sélectionnés
    if (excludedIds.length > 0) {
      queryBuilder.andWhere('product.id NOT IN (:...excludedIds)', { excludedIds });
    }

    // Exclure les produits de l'historique d'achat si fourni
    if (historicAchat) {
      this.excludeHistoryProducts(queryBuilder, historicAchat);
    }

    return await queryBuilder
      .orderBy('RANDOM()') // MySQL/MariaDB - Utilisez RANDOM() pour PostgreSQL
      .limit(count)
      .getMany();
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
   * Calcule et sauvegarde les recommandations basées sur les favoris
   */
  private async calculateAndUpsertRecommendation(profileId: number): Promise<Recommendation> {
    const favoris = await this.favorisRepository.find({
      where: {
        profile: { id: profileId.toString() },
        isFavoris: true
      },
      relations: ['profile', 'product', 'product.categories', 'product.artists']
    });

    const artistFav = this.calculateMostFrequentArtistFromProducts(favoris);
    const categoryFav = this.calculateMostFrequentCategoryFromProducts(favoris);

    const recommendationData: Partial<Recommendation> = {
      categoryFav,
      artistFav,
    };

    return await this.upsertRecommendationForProfile(profileId.toString(), recommendationData);
  }

  /**
   * Calcule l'artiste le plus fréquent à partir des produits favoris
   */
  private calculateMostFrequentArtistFromProducts(favoris: Favoris[]): string {
    if (favoris.length === 0) return '';

    const artistCounts: Record<string, number> = {};

    favoris.forEach(fav => {
      if (fav.product && fav.product.artists) {
        fav.product.artists.forEach(artist => {
          artistCounts[artist.id] = (artistCounts[artist.id] || 0) + 1;
        });
      }
    });

    if (Object.keys(artistCounts).length === 0) return '';

    return Object.keys(artistCounts).reduce((a, b) =>
      artistCounts[a] > artistCounts[b] ? a : b
    );
  }

  /**
   * Calcule la catégorie la plus fréquente à partir des produits favoris
   */
  private calculateMostFrequentCategoryFromProducts(favoris: Favoris[]): string {
    if (favoris.length === 0) return '';

    const categoryCounts: Record<string, number> = {};

    favoris.forEach(fav => {
      if (fav.product && fav.product.categories) {
        fav.product.categories.forEach(category => {
          categoryCounts[category.id] = (categoryCounts[category.id] || 0) + 1;
        });
      }
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

    if (recommendation.artistFav) {
      conditions.push('artist.id = :artistFav');
      parameters.artistFav = recommendation.artistFav;
    }

    if (conditions.length > 0) {
      queryBuilder.where(`(${conditions.join(' OR ')})`, parameters);
    }
    //tej les bail deja acheter
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
        if(product.categories){
            product.categories.forEach(category => {
              counts[category.id] = (counts[category.id] || 0) + 1;
            });
        }
    });
    return counts;
  }

  private countArtists(products: Product[]): Record<string, number> {
    const counts: Record<string, number> = {};
    products.forEach(product => {
        if(product.artists){
            product.artists.forEach(artist => {
              counts[artist.id] = (counts[artist.id] || 0) + 1;
            });
        }
    });
    return counts;
  }

  private getMostFrequent(counts: Record<string, number>): string {
    const keys = Object.keys(counts);
    if (keys.length === 0) return '';
    return keys.reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  public extractArticleId(rawBody: any, contentType: string): string | null {
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