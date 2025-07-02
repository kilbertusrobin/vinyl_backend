import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'src/shared';
import { Profile } from '../../profile/entities/profile.entity';
import { Product } from '../../product/entities/product.entity';
import { IsBoolean } from 'class-validator';

@Entity('favoris')
export class Favoris extends AbstractEntity {

  @Column()
  @IsBoolean()
  isFavoris: boolean;

  @ManyToOne(() => Profile, profile => profile.favoris, { onDelete: 'CASCADE' })
  profile: Profile;

  @ManyToOne(() => Product, product => product.favoris, { onDelete: 'CASCADE' })
  product: Product;
}
