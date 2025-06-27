import { AbstractDto } from 'src/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsUUID } from 'class-validator';

export class ProfileDto extends AbstractDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  adress: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  postalCode: string;

  @ApiProperty()
  @IsBoolean()
  isEmailSubscriber: boolean;

  @ApiProperty()
  @IsUUID()
  userId: string;
}
