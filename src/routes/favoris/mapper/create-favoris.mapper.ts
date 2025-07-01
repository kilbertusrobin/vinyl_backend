import { CreateFavorisDto } from '../dtos/create-favoris.dto';
import { Favoris } from '../entities/favoris.entity';

export class CreateFavorisMapper {
  static toEntity(dto: CreateFavorisDto): Favoris {
    const entity = new Favoris();
    entity.targetType = dto.targetType;
    entity.targetId = dto.targetId;
    entity.profile = { id: dto.profileId } as any;
    return entity;
  }
}
