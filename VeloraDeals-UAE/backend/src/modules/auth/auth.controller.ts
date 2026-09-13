import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterWithEmailDto, LoginWithEmailDto, RefreshTokenDto } from './dto/email-auth.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleLoginDto, AppleLoginDto } from './dto/social-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ---- Email + Password (يرسل OTP إلزاميًا، لا يُصدر توكنات فورًا) ----
  @Post('register')
  register(@Body() dto: RegisterWithEmailDto) {
    return this.authService.registerWithEmail(dto);
  }

  @Post('login')
  login(@Body() dto: LoginWithEmailDto) {
    return this.authService.loginWithEmail(dto);
  }

  // ---- Phone أو Email + OTP (موحّد) ----
  @Post('otp/request')
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  @Post('otp/verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  // ---- Social Login ----
  @Post('google')
  loginWithGoogle(@Body() dto: GoogleLoginDto) {
    return this.authService.loginWithGoogle(dto.idToken);
  }

  @Post('apple')
  loginWithApple(@Body() dto: AppleLoginDto) {
    return this.authService.loginWithApple(dto.idToken, dto.fullName);
  }

  // ---- Terms & Conditions ----
  @Post('accept-terms')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  acceptTerms(@Req() req: any) {
    return this.authService.acceptTerms(req.user.userId);
  }

  // ---- Shared ----
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshCustomerToken(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  logout(@Req() req: any) {
    return this.authService.logout(req.user.userId);
  }
}
