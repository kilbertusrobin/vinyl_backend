import { Controller, Get, Param, Post, Body, Patch, Delete, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto, ProductDetailsDto, ProductSimpleDetailsDto } from './dtos/product.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { FilterProductDto } from './dtos/filter-product.dto';
import { JwtAuthGuard } from '../user/auth/strategies/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @Get('with-favoris-status/me')
  async findAllWithFavorisStatus(@Req() req): Promise<ProductSimpleDetailsDto[]> {
    return this.productService.findAllWithFavorisStatus(req.user.id);
  }

  @Get()
  async findAll(): Promise<ProductSimpleDetailsDto[]> {
    return this.productService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @Get('favoris/me')
  async findMyFavoris(@Req() req): Promise<ProductSimpleDetailsDto[]> {
    return this.productService.findFavorisByUserId(req.user.id);
  }



  @Post()
  async create(@Body() dto: CreateProductDto): Promise<ProductDto> {
    return this.productService.create(dto);
  }
  
  @Patch('/:id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto): Promise<ProductDto> {
    return this.productService.update(id, dto);
  }

  @Delete('/:id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productService.delete(id);
  }

  @Get(':id/details')
  async findDetails(@Param('id', ParseUUIDPipe) id: string): Promise<ProductDetailsDto> {
    return this.productService.findDetailsById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @Get(':id/details/me')
  async findDetailsMe(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.productService.findDetailsWithFavorisById(id, req.user.id);
  }

}
