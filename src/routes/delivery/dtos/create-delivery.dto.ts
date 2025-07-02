import { ApiProperty } from '@nestjs/swagger';
import { DeliveryStatus } from '../entities/delivery.entity';
import { IsEnum, IsUUID } from 'class-validator';

export class CreateDeliveryDto {
  @ApiProperty({ enum: DeliveryStatus, default: DeliveryStatus.PREPARATION })
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @ApiProperty()
  @IsUUID()
  orderId: string;
}
