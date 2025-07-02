import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { Repository } from 'typeorm';
import { ProfileDto } from './dtos/profile.dto';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ProfileMapper } from './mapper/profile.mapper';
import { CreateProfileMapper } from './mapper/create-profile.mapper';
import { User } from 'src/routes/user/entities/user.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) private repo: Repository<Profile>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}


  async create(dto: CreateProfileDto): Promise<ProfileDto> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const entity = CreateProfileMapper.toEntity(dto);
    const saved = await this.repo.save(entity);
    return ProfileMapper.toGetDto(saved);
  }

  async update(id: string, dto: UpdateProfileDto): Promise<ProfileDto> {
    const profile = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!profile) throw new NotFoundException('Profil non trouvé');

    Object.assign(profile, dto);

    const updated = await this.repo.save(profile);
    return ProfileMapper.toGetDto(updated);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Profil non trouvé');
    await this.repo.remove(entity);
  }

  async findByUserId(userId: string): Promise<ProfileDto> {
    const entity = await this.repo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (!entity) throw new NotFoundException('Profil non trouvé pour cet utilisateur');
    return ProfileMapper.toGetDto(entity);
  }
}
