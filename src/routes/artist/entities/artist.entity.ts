import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { AbstractEntity } from 'src/shared';
import { IsString } from 'class-validator';
import { Product } from '../../product/entities/product.entity';

@Entity('artists')
export class Artist extends AbstractEntity {
  @Column()
  @IsString()
  name: string;

  @Column()
  @IsString()
  bio: string;

  @OneToMany(() => Product, product => product.artists)
  products: Product[];
}