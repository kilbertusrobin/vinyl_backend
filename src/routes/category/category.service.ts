import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryDto } from './dtos/category.dto';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { CategoryMapper } from './mapper/category.mapper';
import { CreateCategoryMapper } from './mapper/create-category.mapper';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<CategoryDto[]> {
    const categories = await this.categoryRepository.find();
    return categories.map(CategoryMapper.toGetDto);
  }

  async findOne(id: string): Promise<CategoryDto> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }
    return CategoryMapper.toGetDto(category);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryDto> {
    const category = CreateCategoryMapper.toEntity(dto);
    try {
      const saved = await this.categoryRepository.save(category);
      return CategoryMapper.toGetDto(saved);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Une catégorie avec ce nom existe déjà');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDto> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }
    Object.assign(category, dto);
    try {
      const saved = await this.categoryRepository.save(category);
      return CategoryMapper.toGetDto(saved);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Conflit lors de la mise à jour de la catégorie');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }
    await this.categoryRepository.remove(category);
  }
}
