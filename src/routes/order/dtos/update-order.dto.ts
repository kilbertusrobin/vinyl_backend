import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDate, IsArray, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateOrderDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => value ? new Date(value) : value)
  orderDate?: Date;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  productIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  profileId?: string;
}