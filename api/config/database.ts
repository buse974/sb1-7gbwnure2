import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

export default defineConfig({
  connection: 'mysql',
  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('MYSQL_HOST'),
        port: env.get('MYSQL_PORT'),
        user: env.get('MYSQL_USER'),
        password: env.get('MYSQL_PASSWORD'),
        database: env.get('MYSQL_DB_NAME'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations']
      },
      seeders: {
        paths: ['database/seeders']
      },
    },
  },
})