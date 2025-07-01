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

@Injectable()
export class FavorisService {
  constructor(
    @InjectRepository(Favoris) private repo: Repository<Favoris>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
  ) {}

  async findAll(): Promise<FavorisDto[]> {
    const list = await this.repo.find({ relations: ['profile'] });
    return list.map(FavorisMapper.toGetDto);
  }

  async findOne(id: string): Promise<FavorisDto> {
    const entity = await this.repo.findOne({ where: { id }, relations: ['profile'] });
    if (!entity) throw new NotFoundException('Favori non trouvé');
    return FavorisMapper.toGetDto(entity);
  }

  async create(dto: CreateFavorisDto): Promise<FavorisDto> {
    const profile = await this.profileRepo.findOne({ where: { id: dto.profileId } });
    if (!profile) throw new NotFoundException('Profil non trouvé');

    const entity = CreateFavorisMapper.toEntity(dto);
    const saved = await this.repo.save(entity);
    return FavorisMapper.toGetDto(saved);
  }

  async update(id: string, dto: UpdateFavorisDto): Promise<FavorisDto> {
    const favoris = await this.repo.findOne({ where: { id }, relations: ['profile'] });
    if (!favoris) throw new NotFoundException('Favori non trouvé');

    Object.assign(favoris, dto);
    const updated = await this.repo.save(favoris);
    return FavorisMapper.toGetDto(updated);
  }

  async delete(id: string): Promise<void> {
    const favoris = await this.repo.findOne({ where: { id } });
    if (!favoris) throw new NotFoundException('Favori non trouvé');
    await this.repo.remove(favoris);
  }
}
