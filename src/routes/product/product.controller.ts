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

  @Get()
  async findAll(): Promise<ProductSimpleDetailsDto[]> {
    return this.productService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @Get('me')
  async findMyFavoris(@Req() req): Promise<ProductSimpleDetailsDto[]> {
    console.log('Token utilisateur:', req.user);
    return this.productService.findFavorisByUserId(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findOne(id);
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

  @Post('filter')
  async filter(@Body() filter: FilterProductDto) {
    return this.productService.filterProducts(filter);
  }

  @Get('/category/:id')
  async findByCategory(@Param('id', ParseUUIDPipe) id: string): Promise<ProductDto[]> {
    return this.productService.findByCategoryId(id);
  }

  @Get(':id/details')
  async findDetails(@Param('id', ParseUUIDPipe) id: string): Promise<ProductDetailsDto> {
    return this.productService.findDetailsById(id);
  }

  @Get(':id/names')
  async findNames(@Param('id', ParseUUIDPipe) id: string): Promise<ProductSimpleDetailsDto> {
    return this.productService.findSimpleDetailsById(id);
  }

}
