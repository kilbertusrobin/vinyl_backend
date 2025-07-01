import { Profile } from '../entities/profile.entity';
import { ProfileDto } from '../dtos/profile.dto';

export class ProfileMapper {
  static toGetDto(entity: Profile): ProfileDto {
    const dto = new ProfileDto();
    dto.id = entity.id;
    dto.firstName = entity.firstName;
    dto.lastName = entity.lastName;
    dto.adress = entity.adress;
    dto.city = entity.city;
    dto.postalCode = entity.postalCode;
    dto.isEmailSubscriber = entity.isEmailSubscriber;
    dto.userId = entity.user?.id;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
