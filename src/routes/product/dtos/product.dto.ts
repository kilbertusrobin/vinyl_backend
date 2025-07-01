import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsArray, IsNumber } from 'class-validator';
import { AbstractDto } from 'src/shared';

export class ProductDto extends AbstractDto {
  @ApiProperty()
  @IsString()
  productName: string;

  @ApiProperty()
  @IsString()
  year: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty({ type: [String], description: 'Liste des IDs des artistes', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  artistIds?: string[];

  @ApiProperty({ type: [String], description: 'Liste des IDs des catégories', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];
}
