import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { Repository } from 'typeorm';
import { DeliveryDto } from './dtos/delivery.dto';
import { CreateDeliveryDto } from './dtos/create-delivery.dto';
import { UpdateDeliveryDto } from './dtos/update-delivery.dto';
import { DeliveryMapper } from './mapper/delivery.mapper';
import { CreateDeliveryMapper } from './mapper/create-delivery.mapper';
import { Order } from '../order/entities/order.entity';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(): Promise<DeliveryDto[]> {
    const deliveries = await this.deliveryRepository.find({ relations: ['order'] });
    return deliveries.map(DeliveryMapper.toGetDto);
  }

  async findOne(id: string): Promise<DeliveryDto> {
    const delivery = await this.deliveryRepository.findOne({ where: { id }, relations: ['order'] });
    if (!delivery) throw new NotFoundException('Livraison introuvable');
    return DeliveryMapper.toGetDto(delivery);
  }

  async create(dto: CreateDeliveryDto): Promise<DeliveryDto> {
    const order = await this.orderRepository.findOne({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Commande non trouvée');

    const existing = await this.deliveryRepository.findOne({ where: { order: { id: dto.orderId } } });
    if (existing) throw new ConflictException('Cette commande a déjà une livraison');

    const entity = CreateDeliveryMapper.toEntity(dto);
    entity.order = order;

    const saved = await this.deliveryRepository.save(entity);
    return DeliveryMapper.toGetDto(saved);
  }

  async update(id: string, dto: UpdateDeliveryDto): Promise<DeliveryDto> {
    const delivery = await this.deliveryRepository.findOne({ where: { id }, relations: ['order'] });
    if (!delivery) throw new NotFoundException('Livraison introuvable');

    if (dto.status) delivery.status = dto.status;

    const saved = await this.deliveryRepository.save(delivery);
    return DeliveryMapper.toGetDto(saved);
  }

  async delete(id: string): Promise<void> {
    const delivery = await this.deliveryRepository.findOne({ where: { id } });
    if (!delivery) throw new NotFoundException('Livraison introuvable');
    await this.deliveryRepository.remove(delivery);
  }
}
