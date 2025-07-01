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

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<ProductSimpleDetailsDto[]> {
    const products = await this.productRepository.find({ relations: ['artists', 'categories'] });
    return products.map(ProductMapper.toSimpleDetailsDto);
  }

  async findOne(id: string): Promise<ProductDto> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['artists', 'categories'] });
    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }
    return ProductMapper.toGetDto(product);
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

  async filterProducts(filter: FilterProductDto): Promise<Product[]> {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.artists', 'artist')
      .leftJoinAndSelect('product.categories', 'category');

    if (filter.productName) {
      query.andWhere('product.productName ILIKE :productName', { productName: `%${filter.productName}%` });
    }
    if (filter.artistName) {
      query.andWhere('artist.name ILIKE :artistName', { artistName: `%${filter.artistName}%` });
    }
    if (filter.date) {
      query.andWhere('product.date = :date', { date: filter.date });
    }
    if (filter.price) {
      query.andWhere('product.price = :price', { price: filter.price });
    }

    return query.getMany();
  }

  async findByCategoryId(categoryId: string): Promise<ProductDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.artists', 'artist')
      .where('category.id = :categoryId', { categoryId })
      .getMany();

    return products.map(ProductMapper.toGetDto);
  }

  async findDetailsById(id: string): Promise<ProductDetailsDto> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['artists', 'categories'] });
    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }
    return ProductMapper.toDetailsDto(product);
  }

  async findSimpleDetailsById(id: string): Promise<ProductSimpleDetailsDto> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['artists', 'categories'] });
    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }
    return ProductMapper.toSimpleDetailsDto(product);
  }

}
