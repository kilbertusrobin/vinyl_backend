import { Injectable, ConflictException, UnauthorizedException, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from "./dtos/register.dto";
import { UserService } from "../user.service";
import * as bcrypt from 'bcrypt';
import { UserDto } from "../dtos/user.dto";
import { LoginDto } from "./dtos/login.dto";
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { UserMapper } from '../mapper/user.mapper';
import { User } from '../entities/user.entity';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import { ModifyPasswordDto } from "./dtos/modify-password.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(dto: RegisterDto): Promise<UserDto> {
    if (dto.password !== dto.verifyPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas.');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verifyEmailToken = crypto.randomBytes(128).toString('hex');
    try {
      const userEntity = UserMapper.fromCreateDto({
        email: dto.email,
        password: hashedPassword,
        isActive: false,
      });
      userEntity.verifyEmailToken = verifyEmailToken;
      const saved = await this.userRepository.save(userEntity);
      return UserMapper.toGetDto(saved);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Cet email est déjà utilisé');
      }
      throw error;
    }
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<UserDto> {
    const user = await this.userRepository.findOne({ where: { verifyEmailToken: dto.verifyEmailToken } });
    if (!user) {
      throw new NotFoundException('Token invalide ou déjà utilisé');
    }
    user.isActive = true;
    user.verifyEmailToken = null;
    const saved = await this.userRepository.save(user);
    return UserMapper.toGetDto(saved);
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userService.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    if (!user.isActive) {
      throw new ForbiddenException('Votre compte n\'est pas activé. Veuillez vérifier votre email.');
    }
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);
    return {
      access_token
    };
  }

  async resetPasswordRequest(dto: ResetPasswordDto): Promise<{ message: string; resetPasswordToken?: string }> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException('Aucun compte n\'existe avec cet email.');
    }
    if (!user.isActive) {
      throw new ForbiddenException('Le compte n\'est pas activé.');
    }
    user.resetPasswordToken = crypto.randomBytes(128).toString('hex');
    await this.userRepository.save(user);
    return {
      message: 'Un lien de réinitialisation a été généré.',
      resetPasswordToken: user.resetPasswordToken,
    };
  }

  async modifyPassword(dto: ModifyPasswordDto): Promise<{ message: string }> {
    if (dto.newPassword !== dto.verifyPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas.');
    }
    const user = await this.userRepository.findOne({ where: { resetPasswordToken: dto.resetPasswordToken } });
    if (!user) {
      throw new NotFoundException('Token de réinitialisation invalide ou expiré.');
    }
    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.resetPasswordToken = null as any;
    await this.userRepository.save(user);
    return { message: 'Le mot de passe a été modifié avec succès.' };
  }
}

