import { Body, Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { username?: string; password?: string }) {
    return this.authService.login(body?.username?.trim() ?? '', body?.password ?? '')
  }

  @Get('me')
  me(@Headers('authorization') authorization?: string) {
    const token = extractBearerToken(authorization)
    if (!token || !this.authService.validate(token)) {
      throw new UnauthorizedException('Требуется авторизация')
    }

    return { ok: true }
  }
}

function extractBearerToken(header?: string) {
  if (!header) {
    return ''
  }
  const [type, token] = header.split(' ')
  if (type?.toLowerCase() !== 'bearer') {
    return ''
  }
  return token ?? ''
}
