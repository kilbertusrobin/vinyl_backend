import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendVerifyEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;
} 