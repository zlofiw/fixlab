import { Injectable, UnauthorizedException } from '@nestjs/common'
import { randomBytes } from 'node:crypto'

@Injectable()
export class AuthService {
  private readonly sessions = new Set<string>()

  login(username: string, password: string) {
    const adminUser = process.env.FIXLAB_ADMIN_USER ?? 'admin'
    const adminPassword = process.env.FIXLAB_ADMIN_PASSWORD ?? 'admin123'

    if (username !== adminUser || password !== adminPassword) {
      throw new UnauthorizedException('Неверный логин или пароль')
    }

    const token = randomBytes(24).toString('hex')
    this.sessions.add(token)
    return { token, username: adminUser }
  }

  validate(token: string) {
    return this.sessions.has(token)
  }
}
