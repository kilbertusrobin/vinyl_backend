import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { AbstractEntity } from 'src/shared';
import { IsNumber, IsString } from 'class-validator';
import { Artist } from '../../artist/entities/artist.entity';
import { Category } from '../../category/entities/category.entity';
import { Order } from '../../order/entities/order.entity';


@Entity('products')
export class Product extends AbstractEntity {
  @Column()
  @IsString()
  productName: string;

  @Column()
  @IsString()
  year: string;

  @Column()
  @IsNumber()
  price: number;

  @ManyToMany(() => Artist, artist => artist.products, { cascade: true })
  @JoinTable()
  artists: Artist[];

  @ManyToMany(() => Category, category => category.products, { cascade: true })
  @JoinTable()
  categories: Category[];

  @ManyToMany(() => Order, order => order.products)
  orders: Order[];
}
