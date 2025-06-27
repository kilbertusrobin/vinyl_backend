import { Controller, Get, Param, Post, Body, Patch, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto } from './dtos/product.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { FilterProductDto } from './dtos/filter-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(): Promise<ProductDto[]> {
    return this.productService.findAll();
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
}
