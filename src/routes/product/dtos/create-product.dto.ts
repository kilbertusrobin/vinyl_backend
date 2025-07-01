import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsUUID, IsOptional, IsNumber } from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  productName: string;

  @ApiProperty()
  @IsString()
  year: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  artistIds?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];
}
