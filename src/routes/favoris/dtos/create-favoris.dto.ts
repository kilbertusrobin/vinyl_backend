import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { TargetType } from '../entities/favoris.entity';

export class CreateFavorisDto {
  @ApiProperty({ enum: TargetType })
  @IsEnum(TargetType)
  targetType: TargetType;

  @ApiProperty()
  @IsString()
  targetId: string;

  @ApiProperty()
  @IsUUID()
  profileId: string;
}
