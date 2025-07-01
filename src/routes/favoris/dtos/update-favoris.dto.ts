import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TargetType } from '../entities/favoris.entity';

export class UpdateFavorisDto {
  @ApiPropertyOptional({ enum: TargetType })
  @IsOptional()
  @IsEnum(TargetType)
  targetType?: TargetType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetId?: string;
}
