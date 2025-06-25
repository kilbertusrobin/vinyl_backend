import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class AbstractDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsDate()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;
}

