import { CreateDeliveryDto } from '../dtos/create-delivery.dto';
import { Delivery } from '../entities/delivery.entity';

export class CreateDeliveryMapper {
  static toEntity(dto: CreateDeliveryDto): Delivery {
    const delivery = new Delivery();
    delivery.status = dto.status;
    delivery.order = { id: dto.orderId } as any;
    return delivery;
  }
}
