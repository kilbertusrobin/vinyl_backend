import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RoleEnum } from 'src/shared/enum/role.enum';

@Injectable()
export class RoleInitService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onApplicationBootstrap() {
    const enumRoles = Object.values(RoleEnum);

    const dbRoles = await this.roleRepository.find();
    const dbRoleNames = dbRoles.map(r => r.name);

    for (const role of enumRoles) {
      if (!dbRoleNames.includes(role)) {
        await this.roleRepository.save({ name: role });
      }
    }

    for (const dbRole of dbRoles) {
      if (!enumRoles.includes(dbRole.name)) {
        await this.roleRepository.delete(dbRole.id);
      }
    }
  }
}