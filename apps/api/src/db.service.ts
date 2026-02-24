import { Injectable, OnModuleInit } from '@nestjs/common'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

@Injectable()
export class DbService implements OnModuleInit {
  private db!: DatabaseSync

  onModuleInit() {
    const dbPath = resolve(process.cwd(), 'data', 'fixlab.sqlite')
    mkdirSync(dirname(dbPath), { recursive: true })
    this.db = new DatabaseSync(dbPath)
    this.migrate()
  }

  connection() {
    return this.db
  }

  private migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        ticket_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `)
  }
}
