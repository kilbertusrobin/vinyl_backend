import { FavorisDto } from '../dtos/favoris.dto';
import { Favoris } from '../entities/favoris.entity';

export class FavorisMapper {
  static toGetDto(entity: Favoris): FavorisDto {
    const dto = new FavorisDto();
    dto.id = entity.id;
    dto.targetType = entity.targetType;
    dto.targetId = entity.targetId;
    dto.profileId = entity.profile?.id;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
