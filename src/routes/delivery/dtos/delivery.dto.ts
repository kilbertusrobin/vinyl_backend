import { AbstractDto } from 'src/shared';
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryStatus } from '../entities/delivery.entity';
import { IsEnum, IsUUID } from 'class-validator';

export class DeliveryDto extends AbstractDto {
  @ApiProperty({ enum: DeliveryStatus })
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @ApiProperty()
  @IsUUID()
  orderId: string;
}
