import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'
import { ADMIN_SESSION_COOKIE } from './constants'
import { AuthService } from './auth.service'

type AuthenticatedRequest = Request & {
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

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const rawToken = request.cookies?.[ADMIN_SESSION_COOKIE]

    if (!rawToken) {
      throw new UnauthorizedException('Требуется авторизация администратора')
    }

    const payload = this.authService.getSessionUser(String(rawToken))

    if (!payload) {
      throw new UnauthorizedException('Сессия недействительна или истекла')
    }

    request.authUser = payload.user
    request.authSession = payload.session
    return true
  }
}
