import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 1000, description: 'Montant en centimes' })
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'eur', description: 'Devise (e.g. eur, usd)' })
  @IsString()
  currency: string;
}