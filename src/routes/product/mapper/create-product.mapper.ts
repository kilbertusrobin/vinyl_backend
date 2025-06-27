import { CreateProductDto } from '../dtos/create-product.dto';
import { Product } from '../entities/product.entity';

export class CreateProductMapper {
  static toGetDto(product: Product): CreateProductDto {
    const dto = new CreateProductDto();
    dto.productName = product.productName;
    dto.artistIds = product.artists?.map(artist => artist.id) ?? [];
    dto.categoryIds = product.categories?.map(category => category.id) ?? [];
    return dto;
  }

  static toEntity(dto: CreateProductDto): Product {
    const product = new Product();
    product.productName = dto.productName;
    product.artists = dto.artistIds?.map(id => ({ id } as any)) ?? [];
    product.categories = dto.categoryIds?.map(id => ({ id } as any)) ?? [];
    return product;
  }
}
