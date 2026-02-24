import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import type { Request, Response } from 'express'
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_TTL_MS } from './constants'
import { AuthService } from './auth.service'
import { SessionAuthGuard } from './session-auth.guard'

interface LoginDto {
  username?: string
  password?: string
}

type AuthRequest = Request & {
  authUser?: {
    id: string
    username: string
  }
  authSession?: {
    id: string
    expiresAt: string
    lastSeenAt: string
  }
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) {
    const username = body?.username?.trim() ?? ''
    const password = body?.password ?? ''

    if (!username || !password) {
      throw new UnauthorizedException('Введите логин и пароль')
    }

    const auth = this.authService.login(username, password)
    if (!auth) {
      throw new UnauthorizedException('Неверный логин или пароль')
    }

    response.cookie(ADMIN_SESSION_COOKIE, auth.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: ADMIN_SESSION_TTL_MS,
      path: '/',
    })

    return {
      user: auth.user,
      session: {
        expiresAt: auth.session.expiresAt,
      },
    }
  }

  @Post('logout')
  logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const rawToken = request.cookies?.[ADMIN_SESSION_COOKIE]
    if (typeof rawToken === 'string' && rawToken.length > 0) {
      this.authService.logout(rawToken)
    }

    response.clearCookie(ADMIN_SESSION_COOKIE, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    })

    return {
      ok: true,
    }
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  me(@Req() request: AuthRequest) {
    return {
      user: request.authUser,
      session: request.authSession,
    }
  }
}
