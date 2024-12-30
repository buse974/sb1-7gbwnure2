import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    // Add users table if not exists
    if (!(await this.schema.hasTable('users'))) {
      this.schema.createTable('users', (table) => {
        table.string('id').primary()
        table.string('name').notNullable()
        table.string('email').notNullable().unique()
        table.string('password_hash').notNullable()
        table.enum('role', ['admin', 'user', 'restricted']).defaultTo('user')
        table.boolean('can_manage_tasks_and_routines').defaultTo(false)
        table.timestamp('created_at').notNullable()
        table.timestamp('updated_at').nullable()
      })
    }

    // Add designations table if not exists
    if (!(await this.schema.hasTable('designations'))) {
      this.schema.createTable('designations', (table) => {
        table.string('id').primary()
        table.string('title').notNullable().unique()
        table.timestamp('created_at').notNullable()
        table.timestamp('updated_at').nullable()
      })
    }

    // Add routine_assignments table if not exists
    if (!(await this.schema.hasTable('routine_assignments'))) {
      this.schema.createTable('routine_assignments', (table) => {
        table.string('id').primary()
        table.string('routine_id').references('id').inTable('routines').onDelete('CASCADE')
        table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
        table.timestamp('created_at').notNullable()
        table.timestamp('updated_at').nullable()
      })
    }
  }

  async down() {
    await this.schema.dropTableIfExists('routine_assignments')
    await this.schema.dropTableIfExists('designations')
    await this.schema.dropTableIfExists('users')
  }
}