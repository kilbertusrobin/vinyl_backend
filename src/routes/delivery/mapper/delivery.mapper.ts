import { DeliveryDto } from '../dtos/delivery.dto';
import { Delivery } from '../entities/delivery.entity';

export class DeliveryMapper {
  static toGetDto(delivery: Delivery): DeliveryDto {
    const dto = new DeliveryDto();
    dto.id = delivery.id;
    dto.status = delivery.status;
    dto.orderId = delivery.order?.id;
    dto.createdAt = delivery.createdAt;
    dto.updatedAt = delivery.updatedAt;
    return dto;
  }
}
