import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArtistDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  bio: string;
}
