import { CreateProductDto } from '../dtos/create-product.dto';
import { Product } from '../entities/product.entity';

export class CreateProductMapper {
  static toGetDto(product: Product): CreateProductDto {
    const dto = new CreateProductDto();
    dto.productName = product.productName;
    dto.date = product.date;
    dto.price = product.price;
    dto.description = product.description;
    dto.artistIds = product.artists?.map(artist => artist.id) ?? [];
    dto.categoryIds = product.categories?.map(category => category.id) ?? [];
    return dto;
  }

  static toEntity(dto: CreateProductDto): Product {
    const product = new Product();
    product.productName = dto.productName;
    product.date = dto.date;
    product.price = dto.price;
    product.description = dto.description;
    product.artists = dto.artistIds?.map(id => ({ id } as any)) ?? [];
    product.categories = dto.categoryIds?.map(id => ({ id } as any)) ?? [];
    return product;
  }
}
