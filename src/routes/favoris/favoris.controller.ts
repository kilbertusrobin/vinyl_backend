import { Controller, Get, Post, Patch, Delete, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { FavorisService } from './favoris.service';
import { CreateFavorisDto } from './dtos/create-favoris.dto';
import { UpdateFavorisDto } from './dtos/update-favoris.dto';
import { FavorisDto } from './dtos/favoris.dto';

@Controller('favoris')
export class FavorisController {
  constructor(private readonly service: FavorisService) {}

  @Get()
  findAll(): Promise<FavorisDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<FavorisDto> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFavorisDto): Promise<FavorisDto> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFavorisDto): Promise<FavorisDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.delete(id);
  }
}
