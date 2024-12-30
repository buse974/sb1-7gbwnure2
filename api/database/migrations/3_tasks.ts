import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('title').notNullable()
      table.text('description').nullable()
      table.enum('status', ['available', 'in-progress', 'pending', 'completed']).defaultTo('available')
      table.string('zone_id').references('id').inTable('zones').onDelete('SET NULL')
      table.string('sub_zone_id').references('id').inTable('sub_zones').onDelete('SET NULL')
      table.timestamp('action_date').notNullable()
      table.boolean('has_deadline').defaultTo(false)
      table.timestamp('deadline_date').nullable()
      table.boolean('is_routine').defaultTo(false)
      table.string('designation_id').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('collaborators', (table) => {
      table.string('id').primary()
      table.string('task_id').references('id').inTable('tasks').onDelete('CASCADE')
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.enum('status', ['assigned', 'active', 'paused', 'completed']).defaultTo('assigned')
      table.timestamp('joined_at').notNullable()
      table.timestamp('started_at').nullable()
      table.integer('time_spent').defaultTo(0)
      table.timestamp('last_status_change').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('status_history', (table) => {
      table.string('id').primary()
      table.string('task_id').references('id').inTable('tasks').onDelete('CASCADE')
      table.enum('status', ['available', 'in-progress', 'pending', 'completed']).notNullable()
      table.timestamp('timestamp').notNullable()
      table.string('user_id').references('id').inTable('users').onDelete('SET NULL')
      table.string('reason').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable('status_history')
    this.schema.dropTable('collaborators')
    this.schema.dropTable(this.tableName)
  }
}