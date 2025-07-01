import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsUUID, IsOptional, IsNumber, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';
import { AbstractDto } from 'src/shared';
const { parse } = require('date-fns');

export class ProductDto extends AbstractDto {
  @ApiProperty()
  @IsString()
  productName: string;

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
