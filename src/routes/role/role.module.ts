import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RoleInitService } from './role-init.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleInitService],
  exports: [TypeOrmModule],
})
export class RoleModule {}