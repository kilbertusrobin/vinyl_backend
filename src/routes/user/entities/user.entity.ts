import { IsBoolean, IsEmail, IsOptional, IsString, IsStrongPassword } from 'class-validator';
import { AbstractEntity } from 'src/shared';
import { Column, Entity } from 'typeorm';

@Entity('users')
export class User extends AbstractEntity {

  @IsEmail()
  @Column({ unique: true })
  email: string;

  @Column()
  @IsString()
  @IsStrongPassword()
  password: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  verifyEmailToken: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  resetPasswordToken: string;

  @Column()
  @IsBoolean()
  isActive: boolean;

}
