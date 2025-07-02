import { Column, Entity, ManyToMany } from 'typeorm';
import { AbstractEntity } from 'src/shared';
import { IsString } from 'class-validator';
import { Product } from '../../product/entities/product.entity';

@Entity('categories')
export class Category extends AbstractEntity {
  @Column()
  @IsString()
  categoryName: string;

  @ManyToMany(() => Product, product => product.categories)
  products: Product[];
}
