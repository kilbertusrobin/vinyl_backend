import { Controller, Get, Post, Patch, Delete, Param, Body, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ProfileDto } from './dtos/profile.dto';
import { JwtAuthGuard } from '../user/auth/strategies/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @Get('me')
  async getMyProfile(@Req() req) {
    return this.service.findByUserId(req.user.id);
  }

  @Get()
  findAll(): Promise<ProfileDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProfileDto> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateProfileDto): Promise<ProfileDto> {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProfileDto): Promise<ProfileDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.delete(id);
  }
}
