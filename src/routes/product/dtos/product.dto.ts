import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsUUID, IsOptional, IsNumber, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';
import { AbstractDto } from 'src/shared';
import { ArtistDto } from '../../artist/dtos/artist.dto';
import { CategoryDto } from '../../category/dtos/category.dto';
const { parse } = require('date-fns');

export class ProductDto extends AbstractDto {
  @ApiProperty()
  @IsString()
  productName: string;

  @ApiProperty()
  @IsString()
  imagePath: string;

  @Transform(({ value }) => {
    if (typeof value !== 'string') return null;
    const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  })
  @IsDate()
  date: Date;
  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;


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

export class ProductDetailsDto extends AbstractDto {
  @ApiProperty()
  @IsString()
  productName: string;

  @ApiProperty()
  @IsDate()
  date: Date;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsString()
  imagePath: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [ArtistDto], description: 'Liste complète des artistes', required: false })
  @IsOptional()
  @IsArray()
  artists?: ArtistDto[];

  @ApiProperty({ type: [CategoryDto], description: 'Liste complète des catégories', required: false })
  @IsOptional()
  @IsArray()
  categories?: CategoryDto[];
}

export class ArtistNameBioDto {
  name: string;
  bio: string;
}

export class ProductSimpleDetailsDto {
  id: string;
  productName: string;
  date: Date;
  price: number;
  imagePath: string;
  description: string;
  artistInfos: ArtistNameBioDto[];
  categoryNames: string[];
  isFavoris?: boolean;
  favorisId?: string | null;
}
