import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword } from 'class-validator';

export class ModifyPasswordDto {
  @ApiProperty()
  @IsString()
  resetPasswordToken: string;

  @ApiProperty()
  @IsString()
  @IsStrongPassword()
  newPassword: string;

  @ApiProperty()
  @IsString()
  verifyPassword: string;

} 