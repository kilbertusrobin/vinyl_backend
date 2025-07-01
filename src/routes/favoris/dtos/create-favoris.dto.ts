import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsBoolean } from 'class-validator';

export class CreateFavorisDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsUUID()
  profileId: string;

  @ApiProperty({ description: 'Indique si le produit est en favoris' })
  @IsBoolean()
  isFavoris: boolean;
}
