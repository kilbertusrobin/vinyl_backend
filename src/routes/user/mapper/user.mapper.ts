import { User } from '../entities/user.entity';
import { UserDto } from '../dtos/user.dto';

export class UserMapper {
  static toGetDto(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }

  static toEntity(dto: UserDto): User {
    const user = new User();
    user.id = dto.id;
    user.email = dto.email;
    user.createdAt = dto.createdAt;
    user.updatedAt = dto.updatedAt;
    return user;
  }
}
