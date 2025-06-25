import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export abstract class AbstractEntity {
  @ApiProperty()
  @IsNumber()
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  @ApiProperty()
  @IsDate()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @ApiProperty()
  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;
}


