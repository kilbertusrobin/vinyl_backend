import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsUUID, IsOptional, IsNumber, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';
const { parse } = require('date-fns');

export class FilterProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  artistName?: string;

  @Transform(({ value }) => {
    if (typeof value !== 'string') return null;
    const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  })
  @IsDate()
  date: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;
}