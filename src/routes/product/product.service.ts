import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductDto, ProductDetailsDto, ProductSimpleDetailsDto } from './dtos/product.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductMapper } from './mapper/product.mapper';
import { CreateProductMapper } from './mapper/create-product.mapper';
import { Artist } from '../artist/entities/artist.entity';
import { Category } from '../category/entities/category.entity';
import { FilterProductDto } from './dtos/filter-product.dto';
import { User } from '../user/entities/user.entity';
import { Profile } from '../profile/entities/profile.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async findAll(): Promise<ProductSimpleDetailsDto[]> {
    const products = await this.productRepository.find({ relations: ['artists', 'categories'] });
    return products.map(ProductMapper.toSimpleDetailsDtoOld);
  }


  async create(dto: CreateProductDto): Promise<ProductDto> {
    const product = CreateProductMapper.toEntity(dto);

    if (dto.artistIds?.length) {
      product.artists = await this.artistRepository.findBy({ id: In(dto.artistIds) });
    }

    if (dto.categoryIds?.length) {
      product.categories = await this.categoryRepository.findBy({ id: In(dto.categoryIds) });
    }

    try {
      const saved = await this.productRepository.save(product);
      return ProductMapper.toGetDto(saved);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Un produit avec ce nom existe déjà');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDto> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['artists', 'categories'] });
    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    if (dto.productName) product.productName = dto.productName;

    if (dto.artistIds) {
      product.artists = await this.artistRepository.findBy({ id: In(dto.artistIds) });
    }

    if (dto.categoryIds) {
      product.categories = await this.categoryRepository.findBy({ id: In(dto.categoryIds) });
    }

    try {
      const saved = await this.productRepository.save(product);
      return ProductMapper.toGetDto(saved);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Conflit lors de la mise à jour du produit');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }
    await this.productRepository.remove(product);
  }





  async findDetailsById(id: string): Promise<ProductDetailsDto> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['artists', 'categories'] });
    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }
    return ProductMapper.toDetailsDto(product);
  }



  async findFavorisByUserId(userId: string): Promise<ProductSimpleDetailsDto[]> {
    
    const profile = await this.profileRepository.findOne({ 
      where: { user: { id: userId } }, 
      relations: ['favoris', 'favoris.product', 'favoris.product.artists', 'favoris.product.categories'] 
    });
    
    if (!profile) {
      throw new NotFoundException('Profil non trouvé pour cet utilisateur');
    }


    return (profile.favoris || [])
      .filter(favori => favori.isFavoris)
      .map(favori => ProductMapper.toSimpleDetailsDto(favori.product));
  }

  async findAllWithFavorisStatus(userId: string): Promise<ProductSimpleDetailsDto[]> {
    // Récupérer le profil de l'utilisateur avec ses favoris
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['favoris', 'favoris.product'],
    });
    // Récupérer tous les produits
    const products = await this.productRepository.find({ relations: ['artists', 'categories'] });
    // Construire une map produitId -> Favoris (pour accès rapide à isFavoris et id)
    const favorisMap = new Map<string, { isFavoris: boolean, favorisId: string }>();
    (profile?.favoris || []).forEach(f => {
      if (f.product && f.product.id) {
        favorisMap.set(f.product.id, { isFavoris: f.isFavoris, favorisId: f.id });
      }
    });
    // Retourner tous les produits avec le champ isFavoris et favorisId
    return products.map(product => {
      const favoris = favorisMap.get(product.id);
      return ProductMapper.toSimpleDetailsDto(
        product,
        favoris ? favoris.isFavoris : false,
        favoris ? favoris.favorisId : null
      );
    });
  }

  async findDetailsWithFavorisById(id: string, userId: string): Promise<{ details: ProductDetailsDto, isFavoris: boolean, favorisId: string | null }> {
    // Détails du produit
    const product = await this.productRepository.findOne({ where: { id }, relations: ['artists', 'categories'] });
    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }
    const details = ProductMapper.toDetailsDto(product);

    // Récupérer le profil de l'utilisateur
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!profile) {
      throw new NotFoundException('Profil non trouvé pour cet utilisateur');
    }

    // Chercher le favoris pour ce profil et ce produit
    const favorisRepo = this.productRepository.manager.getRepository('Favoris');
    const favori = await favorisRepo.findOne({
      where: { profile: { id: profile.id }, product: { id }, isFavoris: true },
    });

    return {
      details,
      isFavoris: !!favori,
      favorisId: favori ? favori.id : null
    };
  }

}
