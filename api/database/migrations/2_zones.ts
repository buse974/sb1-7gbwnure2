import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'zones'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('name').notNullable()
      table.text('description').nullable()
      table.string('color').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('sub_zones', (table) => {
      table.string('id').primary()
      table.string('zone_id').references('id').inTable('zones').onDelete('CASCADE')
      table.string('name').notNullable()
      table.integer('priority').notNullable().defaultTo(2)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable('sub_zones')
    this.schema.dropTable(this.tableName)
  }
}