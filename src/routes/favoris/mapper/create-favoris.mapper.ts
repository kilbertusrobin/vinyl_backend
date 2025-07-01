import { CreateFavorisDto } from '../dtos/create-favoris.dto';
import { Favoris } from '../entities/favoris.entity';

export class CreateFavorisMapper {
  static toEntity(dto: CreateFavorisDto): Favoris {
    const entity = new Favoris();
    entity.product = { id: dto.productId } as any;
    entity.profile = { id: dto.profileId } as any;
    entity.isFavoris = dto.isFavoris;
    return entity;
  }
}
