import { Product } from '../entities/product.entity';
import { ProductDto } from '../dtos/product.dto';
import { CreateProductDto } from '../dtos/create-product.dto';
import { ProductDetailsDto, ProductSimpleDetailsDto } from '../dtos/product.dto';
import { ArtistDto } from '../../artist/dtos/artist.dto';
import { CategoryDto } from '../../category/dtos/category.dto';
import { ArtistNameBioDto } from '../dtos/product.dto';

export class ProductMapper {
  static toGetDto(product: Product): ProductDto {
    const dto = new ProductDto();
    dto.id = product.id;
    dto.productName = product.productName;
    dto.date = product.date;
    dto.price = product.price;
    dto.description = product.description;
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
    product.date = dto.date;
    product.price = dto.price;
    product.description = dto.description;
    product.artists = dto.artistIds?.map(id => ({ id } as any)) ?? [];
    product.categories = dto.categoryIds?.map(id => ({ id } as any)) ?? [];
    product.createdAt = dto.createdAt;
    product.updatedAt = dto.updatedAt;
    return product;
  }

  static fromCreateDto(dto: CreateProductDto): Product {
    const product = new Product();
    product.productName = dto.productName;
    product.date = dto.date;
    product.price = dto.price;
    product.description = dto.description;
    product.artists = dto.artistIds?.map(id => ({ id } as any)) ?? [];
    product.categories = dto.categoryIds?.map(id => ({ id } as any)) ?? [];
    return product;
  }

  static toDetailsDto(product: Product): ProductDetailsDto {
    const dto = new ProductDetailsDto();
    dto.id = product.id;
    dto.productName = product.productName;
    dto.date = product.date;
    dto.price = product.price;
    dto.description = product.description;
    dto.createdAt = product.createdAt;
    dto.updatedAt = product.updatedAt;
    dto.artists = product.artists?.map(artist => {
      const artistDto = new ArtistDto();
      artistDto.id = artist.id;
      artistDto.name = artist.name;
      artistDto.bio = artist.bio;
      return artistDto;
    }) ?? [];
    dto.categories = product.categories?.map(category => {
      const categoryDto = new CategoryDto();
      categoryDto.id = category.id;
      categoryDto.categoryName = category.categoryName;
      return categoryDto;
    }) ?? [];
    return dto;
  }

  static toSimpleDetailsDto(product: Product, isFavoris?: boolean): ProductSimpleDetailsDto {
    return {
      id: product.id,
      productName: product.productName,
      artistInfos: product.artists?.map(a => ({ name: a.name, bio: a.bio })) ?? [],
      categoryNames: product.categories?.map(c => c.categoryName) ?? [],
      date: product.date,
      price: product.price,
      imagePath: product.imagePath ?? '',
      description: product.description ?? '',
      isFavoris: isFavoris,
    }
  }

  static toSimpleDetailsDtoOld(product: Product): ProductSimpleDetailsDto {
    return ProductMapper.toSimpleDetailsDto(product, undefined);
  }
}
