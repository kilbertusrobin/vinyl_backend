import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from 'src/shared';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Artist } from '../../artist/entities/artist.entity';
import { Category } from '../../category/entities/category.entity';
import { Order } from '../../order/entities/order.entity';
import { Favoris } from '../../favoris/entities/favoris.entity';


@Entity('products')
export class Product extends AbstractEntity {
  @Column()
  @IsString()
  productName: string;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  @IsNumber()
  price: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ManyToMany(() => Artist, artist => artist.products, { cascade: true })
  @JoinTable()
  artists?: Artist[];

  @ManyToMany(() => Category, category => category.products, { cascade: true })
  @JoinTable()
  categories?: Category[];

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  imagePath?: string; 

  @ManyToMany(() => Order, order => order.products)
  orders?: Order[];

  @OneToMany(() => Favoris, favoris => favoris.product)
  favoris?: Favoris[];
}
