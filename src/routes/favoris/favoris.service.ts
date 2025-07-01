import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favoris } from './entities/favoris.entity';
import { Repository } from 'typeorm';
import { FavorisDto } from './dtos/favoris.dto';
import { CreateFavorisDto } from './dtos/create-favoris.dto';
import { UpdateFavorisDto } from './dtos/update-favoris.dto';
import { FavorisMapper } from './mapper/favoris.mapper';
import { CreateFavorisMapper } from './mapper/create-favoris.mapper';
import { Profile } from '../profile/entities/profile.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class FavorisService {
  constructor(
    @InjectRepository(Favoris) private repo: Repository<Favoris>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async findAll(): Promise<FavorisDto[]> {
    const list = await this.repo.find({ relations: ['profile', 'product'] });
    return list.map(FavorisMapper.toGetDto);
  }

  async findOne(id: string): Promise<FavorisDto> {
    const entity = await this.repo.findOne({ where: { id }, relations: ['profile', 'product'] });
    if (!entity) throw new NotFoundException('Favori non trouvé');
    return FavorisMapper.toGetDto(entity);
  }

  async create(dto: CreateFavorisDto): Promise<FavorisDto> {
    const profile = await this.profileRepo.findOne({ where: { id: dto.profileId } });
    if (!profile) throw new NotFoundException('Profil non trouvé');

    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Produit non trouvé');

    const entity = CreateFavorisMapper.toEntity(dto);
    const saved = await this.repo.save(entity);
    return FavorisMapper.toGetDto(saved);
  }

  async update(id: string, dto: UpdateFavorisDto): Promise<FavorisDto> {
    const favoris = await this.repo.findOne({ where: { id }, relations: ['profile', 'product'] });
    if (!favoris) throw new NotFoundException('Favori non trouvé');

    if (dto.productId) {
      const product = await this.productRepo.findOne({ where: { id: dto.productId } });
      if (!product) throw new NotFoundException('Produit non trouvé');
      favoris.product = product;
    }

    const updated = await this.repo.save(favoris);
    return FavorisMapper.toGetDto(updated);
  }

  async delete(id: string): Promise<void> {
    const favoris = await this.repo.findOne({ where: { id } });
    if (!favoris) throw new NotFoundException('Favori non trouvé');
    await this.repo.remove(favoris);
  }
}
