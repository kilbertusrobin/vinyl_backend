import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from './entities/recommendation.entity';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(Recommendation)
    @InjectRepository(Favoris) private favorisRepository: Repository<Favoris>,
      @InjectRepository(Product) private productRepository: Repository<Product>,

    private readonly recommendationRepository: Repository<Recommendation>,
  ) {}


//Créer une nouvelle recommandation pour un profil
  async create(recommendation: recommendation): Promise<Recommendation> {
    const recommendation = this.recommendationRepository.create(recommendation);
    return await this.recommendationRepository.save(recommendation);
  }


//Récupérer toutes les recommandations
  async findAll(): Promise<Recommendation[]> {
    return await this.recommendationRepository.find({
      relations: ['profile'],
    });
  }


//Récupérer une recommandation par ID
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


//Récupérer les préférences/recommandations par ID de profil
  async getPreferenceByIdProfile(profileId: number): Promise<Recommendation> {
    const recommendation = await this.recommendationRepository.findOne({
      where: { profile: { id: profileId } },
      relations: ['profile'],
    });

    if (!recommendation) {
      throw new NotFoundException(`No recommendation found for profile ID ${profileId}`);
    }

    return recommendation;
  }


//Mettre à jour une recommandation
  async update(id: string, recommendation: recommendation): Promise<Recommendation> {
    const recommendation = await this.findOne(id);

    Object.assign(recommendation, recommendation);

    return await this.recommendationRepository.save(recommendation);
  }


//Mettre à jour les préférences par ID de profil
  async updatePreferenceByProfileId(
    profileId: string,
    recommendation: Recommendation
  ): Promise<Recommendation> {
    const recommendation = await this.getPreferenceByIdProfile(profileId);

    Object.assign(recommendation, recommendation);

    return await this.recommendationRepository.save(recommendation);
  }


//Supprimer une recommandation
  async remove(id: string): Promise<void> {
    const recommendation = await this.findOne(id);
    await this.recommendationRepository.remove(recommendation);
  }


 //Créer ou mettre à jour les préférences pour un profil (upsert)

  async upsertPreferenceForProfile(
    profileId: string,
    recommendation: Partial<recommendation>
  ): Promise<Recommendation> {
    try {
      // Essayer de récupérer la recommandation existante
      const existingRecommendation = await this.getPreferenceByIdProfile(profileId);

      // Si elle existe, la mettre à jour
      Object.assign(existingRecommendation, recommendation);
      return await this.recommendationRepository.save(existingRecommendation);

    } catch (error) {
      // Si elle n'existe pas, en créer une nouvelle
      if (error instanceof NotFoundException) {
        const newRecommendation = this.recommendationRepository.create({
          ...recommendation,
          profile: { id: profileId } as any,
        });
        return await this.recommendationRepository.save(newRecommendation);
      }
      throw error;
    }
  }



}

async getRecommendedProducts(profileId: string): Promise<Product[]> {
  // 1. Récupérer ou créer la recommandation pour ce profil
  let recommendation = await this.getRecommendationByIdProfile(profileId);

  if (!recommendation) {
    // Si pas de recommandation existante, on la calcule
    recommendation = await this.calculateAndUpsertRecommendation(profileId);
  }

  // 2. Récupérer les produits recommandés basés sur categoryFav et artisteFav
  const recommendedProducts = await this.findSimilarProducts(recommendation);

  return recommendedProducts.slice(0, 10); // Limiter à 10 produits
}




private async calculateAndUpsertRecommendation(profileId: string): Promise<Recommendation> {
  // 1. Récupérer tous les favoris du profil
  const favoris = await this.favorisRepository.find({
    where: { profile: { id: profileId } },
    relations: ['profile']
  });

  // 2. Séparer les favoris par type
  const artistFavoris = favoris.filter(fav => fav.targetType === TargetType.ARTIST);
  const productFavoris = favoris.filter(fav => fav.targetType === TargetType.PRODUCT);

  // 3. Calculer artisteFav (l'artiste le plus fréquent)
  let artisteFav = '';
  if (artistFavoris.length > 0) {
    const artistCounts = artistFavoris.reduce((acc, fav) => {
      acc[fav.targetId] = (acc[fav.targetId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    artisteFav = Object.keys(artistCounts).reduce((a, b) =>
      artistCounts[a] > artistCounts[b] ? a : b
    );
  }

  // 4. Calculer categoryFav depuis les produits favoris
  let categoryFav = '';
  if (productFavoris.length > 0) {
    // Récupérer les produits avec leurs catégories
    const products = await this.productRepository.find({
      where: { id: In(productFavoris.map(fav => fav.targetId)) },
      relations: ['categories']
    });

    // Compter les catégories
    const categoryCounts: Record<string, number> = {};
    products.forEach(product => {
      product.categories.forEach(category => {
        categoryCounts[category.id] = (categoryCounts[category.id] || 0) + 1;
      });
    });

    if (Object.keys(categoryCounts).length > 0) {
      categoryFav = Object.keys(categoryCounts).reduce((a, b) =>
        categoryCounts[a] > categoryCounts[b] ? a : b
      );
    }
  }

  // 5. Créer/Mettre à jour la recommandation
  const recommendationData: Partial<Recommendation> = {
    categoryFav,
    artisteFav,

  };

  return await this.upsertRecommendationForProfile(profileId, recommendationData);
}

private async findSimilarProducts(recommendation: Recommendation): Promise<Product[]> {
  const queryBuilder = this.productRepository.createQueryBuilder('product')
    .leftJoinAndSelect('product.artists', 'artist')
    .leftJoinAndSelect('product.categories', 'category');

  const conditions: string[] = [];
  const parameters: any = {};

  // Filtrer par catégorie favorite si elle existe
  if (recommendation.categoryFav) {
    conditions.push('category.id = :categoryFav');
    parameters.categoryFav = recommendation.categoryFav;
  }

  // Filtrer par artiste favori si il existe
  if (recommendation.artisteFav) {
    conditions.push('artist.id = :artisteFav');
    parameters.artisteFav = recommendation.artisteFav;
  }

  // Combiner les conditions avec OR pour avoir plus de résultats
  if (conditions.length > 0) {
    queryBuilder.where(`(${conditions.join(' OR ')})`, parameters);
  }

  // Exclure les produits déjà dans l'historique d'achat
  if (recommendation.historicAchat) {
    const historicIds = recommendation.historicAchat.split(',');
    queryBuilder.andWhere('product.id NOT IN (:...historicIds)', { historicIds });
  }

  // Ordonner par pertinence (vous pouvez ajuster cette logique)
  queryBuilder
    .orderBy('RAND()') // Ordre aléatoire pour varier les recommandations
    .limit(10); // Récupérer plus que nécessaire pour avoir des options

  return await queryBuilder.getMany();
}


// Nouvelle méthode dans le service
async getRecommendedProductsFromHistory(profileId: string): Promise<Product[]> {
  // 1. Récupérer ou créer la recommandation pour ce profil
  let recommendation = await this.getRecommendationByIdProfile(profileId);

  if (!recommendation) {
    // Si pas de recommandation existante, on la calcule
    recommendation = await this.calculateAndUpsertRecommendation(profileId);
  }

  // 2. Calculer les catégories et artistes les plus présents dans l'historique
  const historyBasedPreferences = await this.calculateHistoryBasedPreferences(recommendation.historicAchat);

  // 3. Récupérer les produits recommandés basés sur l'historique
  const recommendedProducts = await this.findSimilarProductsFromHistory(
    historyBasedPreferences,
    recommendation.historicAchat
  );

  return recommendedProducts.slice(0, 10); // Limiter à 10 produits
}

// Méthode pour calculer les préférences basées sur l'historique
private async calculateHistoryBasedPreferences(historicAchat: string): Promise<{
  mostFrequentCategory: string;
  mostFrequentArtist: string;
}> {
  if (!historicAchat || historicAchat.trim() === '') {
    return {
      mostFrequentCategory: '',
      mostFrequentArtist: ''
    };
  }

  // 1. Récupérer les IDs des produits de l'historique
  const historicIds = historicAchat.split(',').map(id => id.trim()).filter(id => id);

  if (historicIds.length === 0) {
    return {
      mostFrequentCategory: '',
      mostFrequentArtist: ''
    };
  }

  // 2. Récupérer les produits de l'historique avec leurs catégories et artistes
  const historicProducts = await this.productRepository.find({
    where: { id: In(historicIds) },
    relations: ['categories', 'artists']
  });

  // 3. Compter les catégories les plus fréquentes
  const categoryCounts: Record<string, number> = {};
  historicProducts.forEach(product => {
    product.categories.forEach(category => {
      categoryCounts[category.id] = (categoryCounts[category.id] || 0) + 1;
    });
  });

  // 4. Compter les artistes les plus fréquents
  const artistCounts: Record<string, number> = {};
  historicProducts.forEach(product => {
    product.artists.forEach(artist => {
      artistCounts[artist.id] = (artistCounts[artist.id] || 0) + 1;
    });
  });

  // 5. Trouver la catégorie la plus fréquente
  let mostFrequentCategory = '';
  if (Object.keys(categoryCounts).length > 0) {
    mostFrequentCategory = Object.keys(categoryCounts).reduce((a, b) =>
      categoryCounts[a] > categoryCounts[b] ? a : b
    );
  }

  // 6. Trouver l'artiste le plus fréquent
  let mostFrequentArtist = '';
  if (Object.keys(artistCounts).length > 0) {
    mostFrequentArtist = Object.keys(artistCounts).reduce((a, b) =>
      artistCounts[a] > artistCounts[b] ? a : b
    );
  }

  return {
    mostFrequentCategory,
    mostFrequentArtist
  };
}

// Méthode pour trouver des produits similaires basés sur l'historique
private async findSimilarProductsFromHistory(
  preferences: { mostFrequentCategory: string; mostFrequentArtist: string },
  historicAchat: string
): Promise<Product[]> {
  const queryBuilder = this.productRepository.createQueryBuilder('product')
    .leftJoinAndSelect('product.artists', 'artist')
    .leftJoinAndSelect('product.categories', 'category');

  const conditions: string[] = [];
  const parameters: any = {};

  // Filtrer par catégorie la plus fréquente dans l'historique
  if (preferences.mostFrequentCategory) {
    conditions.push('category.id = :mostFrequentCategory');
    parameters.mostFrequentCategory = preferences.mostFrequentCategory;
  }

  // Filtrer par artiste le plus fréquent dans l'historique
  if (preferences.mostFrequentArtist) {
    conditions.push('artist.id = :mostFrequentArtist');
    parameters.mostFrequentArtist = preferences.mostFrequentArtist;
  }

  // Combiner les conditions avec OR pour avoir plus de résultats
  if (conditions.length > 0) {
    queryBuilder.where(`(${conditions.join(' OR ')})`, parameters);
  }

  // Exclure les produits déjà dans l'historique d'achat
  if (historicAchat && historicAchat.trim() !== '') {
    const historicIds = historicAchat.split(',').map(id => id.trim()).filter(id => id);
    if (historicIds.length > 0) {
      queryBuilder.andWhere('product.id NOT IN (:...historicIds)', { historicIds });
    }
  }

  // Ordonner par pertinence (ordre aléatoire pour varier les recommandations)
  queryBuilder
    .orderBy('RAND()')
    .limit(10);

  return await queryBuilder.getMany();
}

