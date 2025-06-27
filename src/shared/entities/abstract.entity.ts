import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export abstract class AbstractEntity {
  @ApiProperty()
  @IsString()
  @PrimaryGeneratedColumn('uuid')
  id: string;

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