import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';

export abstract class AbstractDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  updatedAt: Date;
}