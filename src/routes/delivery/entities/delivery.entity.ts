import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from 'src/shared';
import { Order } from '../../order/entities/order.entity';
import { IsEnum } from 'class-validator';

export enum DeliveryStatus {
  PREPARATION = 'preparation',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
}

@Entity('deliveries')
export class Delivery extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PREPARATION,
  })
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @OneToOne(() => Order, order => order.delivery, { onDelete: 'CASCADE' })
  @JoinColumn()
  order: Order;
}
