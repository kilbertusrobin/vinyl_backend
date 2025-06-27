import { User } from 'src/routes/user/entities/user.entity';
import { RoleEnum } from 'src/shared';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RoleEnum, unique: true })
  name: RoleEnum;

  @OneToMany(() => User, user => user.role)
  users: User[];
}