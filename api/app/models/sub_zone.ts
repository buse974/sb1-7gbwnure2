import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Zone from './zone.js'

export default class SubZone extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare zoneId: string

  @column()
  declare name: string

  @column()
  declare priority: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Zone)
  declare zone: BelongsTo<typeof Zone>
}