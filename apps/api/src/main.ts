import 'reflect-metadata'
import cookieParser from 'cookie-parser'
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(cookieParser())
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true)
        return
      }

      const allowed = [
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
      ]

      callback(null, allowed.some((pattern) => pattern.test(origin)))
    },
    credentials: true,
  }
  app.enableCors(corsOptions)
  await app.listen(3001)
}

void bootstrap()
