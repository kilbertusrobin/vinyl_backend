import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'src/shared';
import { Profile } from '../../profile/entities/profile.entity';
import { IsEnum, IsString } from 'class-validator';

export enum TargetType {
  ARTIST = 'artist',
  PRODUCT = 'product',
}

@Entity('favoris')
export class Favoris extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: TargetType,
  })
  @IsEnum(TargetType)
  targetType: TargetType;

  @Column()
  @IsString()
  targetId: string;

  @ManyToOne(() => Profile, profile => profile.favoris, { onDelete: 'CASCADE' })
  profile: Profile;
}
