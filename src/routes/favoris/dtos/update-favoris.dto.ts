import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateFavorisDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productId?: string;
}
