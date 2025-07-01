import { OrderDto } from '../dtos/order.dto';
import { Order } from '../entities/order.entity';

export class OrderMapper {
  static toGetDto(order: Order): OrderDto {
    const dto = new OrderDto();
    dto.id = order.id;
    dto.orderDate = order.orderDate;
    dto.productIds = order.products?.map(p => p.id) ?? [];
    dto.profileId = order.profile?.id;
    dto.deliveryId = order.delivery?.id;
    dto.createdAt = order.createdAt;
    dto.updatedAt = order.updatedAt;
    return dto;
  }
}
