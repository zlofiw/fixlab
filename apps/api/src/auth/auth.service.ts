import { Injectable } from '@nestjs/common'
import { ADMIN_SESSION_TTL_MS } from './constants'
import { createOpaqueToken, verifyPassword } from './crypto'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class AuthService {
  constructor(private readonly databaseService: DatabaseService) {}

  login(usernameRaw: string, password: string) {
    const username = usernameRaw.trim()
    const user = this.databaseService.getUserByUsername(username)

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return null
    }

    const token = createOpaqueToken()
    const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_MS).toISOString()
    const session = this.databaseService.createSession(user.id, token, expiresAt)

    return {
      token,
      session,
      user: {
        id: user.id,
        username: user.username,
      },
    }
  }

  logout(rawToken: string): void {
    if (!rawToken) {
      return
    }

    this.databaseService.deleteSessionByToken(rawToken)
  }

  getSessionUser(rawToken: string) {
    if (!rawToken) {
      return null
    }

    const session = this.databaseService.findSessionByToken(rawToken)
    if (!session) {
      return null
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      this.databaseService.deleteSessionByToken(rawToken)
      return null
    }

    this.databaseService.touchSession(session.id)
    const user = this.databaseService.getUserById(session.userId)

    if (!user) {
      this.databaseService.deleteSessionByToken(rawToken)
      return null
    }

    return {
      user: {
        id: user.id,
        username: user.username,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
        lastSeenAt: session.lastSeenAt,
      },
    }
  }
}
