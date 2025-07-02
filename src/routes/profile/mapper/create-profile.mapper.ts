import { CreateProfileDto } from '../dtos/create-profile.dto';
import { Profile } from '../entities/profile.entity';

export class CreateProfileMapper {
  static toEntity(dto: CreateProfileDto): Profile {
    const entity = new Profile();
    entity.firstName = dto.firstName;
    entity.lastName = dto.lastName;
    entity.adress = dto.adress;
    entity.city = dto.city;
    entity.postalCode = dto.postalCode;
    entity.isEmailSubscriber = dto.isEmailSubscriber;
    entity.user = { id: dto.userId } as any;
    return entity;
  }
}
