import { Controller, Get, Post, Patch, Delete, Param, Body, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderDto } from './dtos/order.dto';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { JwtAuthGuard } from '../user/auth/strategies/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  async findAll(@Req() req): Promise<OrderDto[]> {
    return this.orderService.findAll(req.user.id);
  }

  @Post()
  create(@Body() dto: CreateOrderDto): Promise<OrderDto> {
    return this.orderService.create(dto);
  }


}
