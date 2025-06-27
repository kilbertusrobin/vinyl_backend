import { Product } from '../entities/product.entity';
import { ProductDto } from '../dtos/product.dto';
import { CreateProductDto } from '../dtos/create-product.dto';

export class ProductMapper {
  static toGetDto(product: Product): ProductDto {
    const dto = new ProductDto();
    dto.id = product.id;
    dto.productName = product.productName;
    dto.createdAt = product.createdAt;
    dto.updatedAt = product.updatedAt;
    dto.artistIds = product.artists?.map(artist => artist.id) ?? [];
    dto.categoryIds = product.categories?.map(category => category.id) ?? [];
    return dto;
  }

  static toEntity(dto: ProductDto): Product {
    const product = new Product();
    product.id = dto.id;
    product.productName = dto.productName;
    product.artists = dto.artistIds?.map(id => ({ id } as any)) ?? [];
    product.categories = dto.categoryIds?.map(id => ({ id } as any)) ?? [];
    product.createdAt = dto.createdAt;
    product.updatedAt = dto.updatedAt;
    return product;
  }

  static fromCreateDto(dto: CreateProductDto): Product {
    const product = new Product();
    product.productName = dto.productName;
    product.artists = dto.artistIds?.map(id => ({ id } as any)) ?? [];
    product.categories = dto.categoryIds?.map(id => ({ id } as any)) ?? [];
    return product;
  }
}
