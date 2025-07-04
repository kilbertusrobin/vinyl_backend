import { IsBoolean, IsEmail, IsOptional, IsString, IsStrongPassword } from 'class-validator';
import { AbstractEntity } from 'src/shared';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Profile } from '../../profile/entities/profile.entity';
import { Role } from 'src/routes/role/entities/role.entity';

@Entity('users')
export class User extends AbstractEntity {

  @IsEmail()
  @Column({ unique: true })
  email: string;

  @Column()
  @IsString()
  @IsStrongPassword()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  @IsString()
  @IsOptional()
  verifyEmailToken: string | null;
  
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  resetPasswordToken: string;

  @Column()
  @IsBoolean()
  isActive: boolean;

  @OneToOne(() => Profile, profile => profile.user, { cascade: true })
  profile: Profile;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

}
