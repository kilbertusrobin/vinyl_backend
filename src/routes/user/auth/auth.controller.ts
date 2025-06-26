import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { UserDto } from '../dtos/user.dto';
import { LoginDto } from './dtos/login.dto';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ModifyPasswordDto } from './dtos/modify-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<UserDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<{ access_token: string }> {
    return this.authService.login(dto);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto): Promise<UserDto> {
    return this.authService.verifyEmail(dto);
  }

  @Post('reset-password')
  resetPasswordRequest(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPasswordRequest(dto);
  }

  @Post('modify-password')
  modifyPassword(@Body() dto: ModifyPasswordDto): Promise<{ message: string }> {
    return this.authService.modifyPassword(dto);
  }
}