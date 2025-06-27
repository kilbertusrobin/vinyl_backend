import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './entities/artist.entity';
import { ArtistDto } from './dtos/artist.dto';
import { CreateArtistDto } from './dtos/create-artist.dto';
import { UpdateArtistDto } from './dtos/update-artist.dto';
import { ArtistMapper } from './mapper/artist.mapper';
import { CreateArtistMapper } from './mapper/create-artist.mapper';

@Injectable()
export class ArtistService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
  ) {}

  async findAll(): Promise<ArtistDto[]> {
    const artists = await this.artistRepository.find();
    return artists.map(ArtistMapper.toGetDto);
  }

  async findOne(id: string): Promise<ArtistDto> {
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) {
      throw new NotFoundException('Artiste non trouvé');
    }
    return ArtistMapper.toGetDto(artist);
  }

  async create(dto: CreateArtistDto): Promise<ArtistDto> {
    const artist = CreateArtistMapper.toEntity(dto);
    try {
      const saved = await this.artistRepository.save(artist);
      return ArtistMapper.toGetDto(saved);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Un artiste avec ce nom existe déjà');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateArtistDto): Promise<ArtistDto> {
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) {
      throw new NotFoundException('Artiste non trouvé');
    }
    Object.assign(artist, dto);
    try {
      const saved = await this.artistRepository.save(artist);
      return ArtistMapper.toGetDto(saved);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException("Conflit lors de la mise à jour de l'artiste");
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) {
      throw new NotFoundException('Artiste non trouvé');
    }
    await this.artistRepository.remove(artist);
  }
}