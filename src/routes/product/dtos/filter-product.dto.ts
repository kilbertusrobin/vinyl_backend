import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class FilterProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  artistName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;
}