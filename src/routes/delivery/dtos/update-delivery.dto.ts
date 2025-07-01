import { ApiProperty } from '@nestjs/swagger';
import { DeliveryStatus } from '../entities/delivery.entity';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateDeliveryDto {
  @ApiProperty({ enum: DeliveryStatus, required: false })
  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus;
}
