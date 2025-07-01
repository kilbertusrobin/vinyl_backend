import { Controller, Get, Param, Post, Body, Patch, Delete, NotFoundException, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDto } from './dtos/category.dto';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(): Promise<CategoryDto[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryDto> {
    return this.categoryService.create(dto);
  }

  @Patch('/:id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto): Promise<CategoryDto> {
    return this.categoryService.update(id, dto);
  }

  @Delete('/:id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categoryService.delete(id);
  }
}
