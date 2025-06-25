import { RegisterDto } from '../dtos/register.dto';
import { Register } from '../entities/register.entity';

export class RegisterMapper {
  static fromDto(dto: RegisterDto): Register {
    const entity = new Register();
    entity.email = dto.email;
    entity.password = dto.password;
    return entity;
  }
}
