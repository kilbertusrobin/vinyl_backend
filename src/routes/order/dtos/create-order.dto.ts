import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsUUID, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  orderDate: Date;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  productIds: string[];

  @ApiProperty()
  @IsUUID()
  profileId: string;
}