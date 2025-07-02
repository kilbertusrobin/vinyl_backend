import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class TestEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;
} 