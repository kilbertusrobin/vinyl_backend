import { Category } from '../entities/category.entity';
import { CategoryDto } from '../dtos/category.dto';
import { CreateCategoryDto } from '../dtos/create-category.dto';

export class CategoryMapper {
  static toGetDto(category: Category): CategoryDto {
    const dto = new CategoryDto();
    dto.id = category.id;
    dto.categoryName = category.categoryName;
    dto.createdAt = category.createdAt;
    dto.updatedAt = category.updatedAt;
    return dto;
  }

  static toEntity(dto: CategoryDto): Category {
    const category = new Category();
    category.id = dto.id;
    category.categoryName = dto.categoryName;
    category.createdAt = dto.createdAt;
    category.updatedAt = dto.updatedAt;
    return category;
  }

  static fromCreateDto(dto: CreateCategoryDto): Category {
    const category = new Category();
    category.categoryName = dto.categoryName;
    return category;
  }
}
