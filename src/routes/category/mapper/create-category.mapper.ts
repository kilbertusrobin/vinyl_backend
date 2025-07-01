import { CreateCategoryDto } from '../dtos/create-category.dto';
import { Category } from '../entities/category.entity';

export class CreateCategoryMapper {
  static toGetDto(category: Category): CreateCategoryDto {
    const dto = new CreateCategoryDto();
    dto.categoryName = category.categoryName;
    return dto;
  }

  static toEntity(dto: CreateCategoryDto): Category {
    const category = new Category();
    category.categoryName = dto.categoryName;
    return category;
  }
}
