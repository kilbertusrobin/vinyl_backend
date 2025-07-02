import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderDto } from './dtos/order.dto';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { OrderMapper } from './mapper/order.mapper';
import { CreateOrderMapper } from './mapper/create-order.mapper';
import { Product } from '../product/entities/product.entity';
import { Profile } from '../profile/entities/profile.entity';
import { Delivery, DeliveryStatus } from '../delivery/entities/delivery.entity';
import { DeliveryService } from '../delivery/delivery.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Profile) private readonly profileRepo: Repository<Profile>,
    private readonly deliveryService: DeliveryService,
  ) {}

  async findAll(userId: string): Promise<OrderDto[]> {
    const profile = await this.profileRepo.findOne({ where: { user: { id: userId } } });
    if (!profile) throw new NotFoundException('Profil introuvable');
    const orders = await this.orderRepo.find({
      where: { profile: { id: profile.id } },
      relations: ['products', 'profile', 'delivery']
    });
    return orders.map(OrderMapper.toGetDto);
  }

  async findAllWithProductDetails(userId: string): Promise<{ orderDate: Date, products: { productName: string, price: number }[] }[]> {
    const profile = await this.profileRepo.findOne({ where: { user: { id: userId } } });
    if (!profile) throw new NotFoundException('Profil introuvable');
    const orders = await this.orderRepo.find({
      where: { profile: { id: profile.id } },
      relations: ['products']
    });
    return orders.map(order => ({
      orderDate: order.orderDate,
      products: order.products.map(p => ({ productName: p.productName, price: p.price }))
    }));
  }

  async create(dto: CreateOrderDto): Promise<OrderDto> {
    const profile = await this.profileRepo.findOne({ where: { id: dto.profileId } });
    if (!profile) throw new NotFoundException('Profil introuvable');

    const order = CreateOrderMapper.toEntity(dto);
    if (dto.productIds?.length) {
      order.products = await this.productRepo.findBy({ id: In(dto.productIds) });
    }

    const savedOrder = await this.orderRepo.save(order);
    const deliveryDto = await this.deliveryService.create({
      status: DeliveryStatus.PREPARATION,
      orderId: savedOrder.id,
    });
    savedOrder.delivery = { id: deliveryDto.id } as any;
    await this.orderRepo.save(savedOrder);

    return OrderMapper.toGetDto({ ...savedOrder, delivery: { id: deliveryDto.id } } as Order);
  }



}
