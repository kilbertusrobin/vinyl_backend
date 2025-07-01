import { AbstractDto } from 'src/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsUUID, IsArray } from 'class-validator';

export class OrderDto extends AbstractDto {
  @ApiProperty()
  @IsDate()
  orderDate: Date;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  productIds: string[];

  @ApiProperty()
  @IsUUID()
  profileId: string;

  @ApiProperty()
  @IsUUID()
  deliveryId: string;
}