import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto } from './dtos/create-delivery.dto';
import { UpdateDeliveryDto } from './dtos/update-delivery.dto';
import { DeliveryDto } from './dtos/delivery.dto';

@Controller('deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get()
  findAll(): Promise<DeliveryDto[]> {
    return this.deliveryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DeliveryDto> {
    return this.deliveryService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDeliveryDto): Promise<DeliveryDto> {
    return this.deliveryService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDeliveryDto): Promise<DeliveryDto> {
    return this.deliveryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deliveryService.delete(id);
  }
}
