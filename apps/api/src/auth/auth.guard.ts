import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers?: { authorization?: string } }>()
    const token = extractBearerToken(request.headers?.authorization)

    if (!token || !this.authService.validate(token)) {
      throw new UnauthorizedException('Требуется авторизация администратора')
    }

    return true
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
