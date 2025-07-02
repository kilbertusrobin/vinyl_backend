import { User } from '../entities/user.entity';
import { UserDto } from '../dtos/user.dto';
import { CreateUserDto } from '../dtos/create-user.dto';

export class CreateUserMapper {
  static toGetDto(user: User): CreateUserDto {
    const dto = new CreateUserDto();
    dto.email = user.email;
    dto.password = user.password
    dto.isActive = user.isActive;
    return dto;
  }

  static toEntity(dto: CreateUserDto): User {
    const user = new User();
    user.email = dto.email;
    user.password = dto.password;
    user.isActive = dto.isActive ?? false;
    return user;
  }
}
