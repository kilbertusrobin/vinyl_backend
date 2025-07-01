import { CreateOrderDto } from '../dtos/create-order.dto';
import { Order } from '../entities/order.entity';

export class CreateOrderMapper {
  static toEntity(dto: CreateOrderDto): Order {
    const order = new Order();
    order.orderDate = dto.orderDate;
    order.products = dto.productIds?.map(id => ({ id } as any)) ?? [];
    order.profile = { id: dto.profileId } as any;
    return order;
  }
}
