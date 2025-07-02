import { Controller, Get, Param, NotFoundException, Post, Body, Patch, Delete } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserDto } from "./dtos/user.dto";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  @Get('/:email')
  async findOne(@Param('email') email: string): Promise<UserDto> {
    const user = await this.userService.findOne(email);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(dto);
  }

  @Patch('/:email')
  async update(@Param('email') email: string, @Body() dto: UpdateUserDto): Promise<UserDto> {
    return this.userService.update(email, dto);
  }

  @Delete('/:email')
  async delete(@Param('email') email: string): Promise<void> {
    return this.userService.delete(email);
  }
}