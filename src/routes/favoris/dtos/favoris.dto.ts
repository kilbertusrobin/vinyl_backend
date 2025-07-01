import { AbstractDto } from 'src/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FavorisDto extends AbstractDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsUUID()
  profileId: string;
}
