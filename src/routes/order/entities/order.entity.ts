import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { AbstractEntity } from 'src/shared';
import { Product } from '../../product/entities/product.entity';
import { Profile } from '../../profile/entities/profile.entity';
import { IsDate } from 'class-validator';
import { Delivery } from '../../delivery/entities/delivery.entity';

@Entity('orders')
export class Order extends AbstractEntity {
  @Column()
  @IsDate()
  orderDate: Date;

  @ManyToMany(() => Product, product => product.orders, { cascade: true })
  @JoinTable()
  products: Product[];

  @ManyToOne(() => Profile, profile => profile.orders, { onDelete: 'CASCADE' })
  profile: Profile;

  @OneToOne(() => Delivery, delivery => delivery.order, { cascade: true })
  delivery: Delivery;
}
