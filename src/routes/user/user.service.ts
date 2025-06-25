import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from "./entities/user.entity";
import { UserDto } from "./dtos/user.dto";
import { UserMapper } from "./mapper/user.mapper";
import { CreateUserDto } from "./dtos/create-user.dto";
import { CreateUserMapper } from "./mapper/create-user.mapper";
import { UpdateUserDto } from "./dtos/update-user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find();
    return users.map(UserMapper.toGetDto);
  }

  async findOne(email: string): Promise<UserDto | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
    }
    return user ? UserMapper.toGetDto(user) : null;
  }

  async create(dto: CreateUserDto): Promise<UserDto> {
    const user = CreateUserMapper.toEntity(dto);
    try {
      const saved = await this.userRepository.save(user);
      return UserMapper.toGetDto(saved);
    } catch (error) {
      if (error.code === '23505') { 
        throw new ConflictException('Cet email est déjà utilisé');
      }
      throw error;
    }
  }

  async update(email: string, dto: UpdateUserDto): Promise<UserDto> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    Object.assign(user, dto);
    try {
      const saved = await this.userRepository.save(user);
      return UserMapper.toGetDto(saved);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Cet email est déjà utilisé');
      }
      throw error;
    }
  }

  async delete(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    await this.userRepository.remove(user);
  }
}
