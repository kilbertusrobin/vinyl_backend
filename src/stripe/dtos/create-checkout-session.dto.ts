import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({ example: 1000, description: 'Montant en centimes' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'eur', description: 'Devise (e.g. eur, usd)' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 'https://mon-site/success', description: 'URL de succès' })
  @IsString()
  successUrl: string;

  @ApiProperty({ example: 'https://mon-site/cancel', description: 'URL d\'annulation' })
  @IsString()
  cancelUrl: string;
} 