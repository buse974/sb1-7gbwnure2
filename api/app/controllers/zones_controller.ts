import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Zone from '#models/zone'
import SubZone from '#models/sub_zone'

@inject()
export default class ZonesController {
  async index({ response }: HttpContext) {
    const zones = await Zone.query().preload('subZones')
    return response.json(zones)
  }

  async store({ request, response }: HttpContext) {
    const data = request.only(['name', 'description', 'color'])
    const subZones = request.input('subZones', [])

    const zone = await Zone.create(data)

    if (subZones.length > 0) {
      await Promise.all(
        subZones.map((subZone: any) =>
          SubZone.create({
            ...subZone,
            zoneId: zone.id,
          })
        )
      )
    }

    await zone.load('subZones')
    return response.status(201).json(zone)
  }

  async show({ params, response }: HttpContext) {
    const zone = await Zone.findOrFail(params.id)
    await zone.load('subZones')
    return response.json(zone)
  }

  async update({ params, request, response }: HttpContext) {
    const zone = await Zone.findOrFail(params.id)
    const data = request.only(['name', 'description', 'color'])
    const subZones = request.input('subZones', [])

    await zone.merge(data).save()

    // Update sub-zones
    await SubZone.query().where('zoneId', zone.id).delete()
    if (subZones.length > 0) {
      await Promise.all(
        subZones.map((subZone: any) =>
          SubZone.create({
            ...subZone,
            zoneId: zone.id,
          })
        )
      )
    }

    await zone.load('subZones')
    return response.json(zone)
  }

  async destroy({ params, response }: HttpContext) {
    const zone = await Zone.findOrFail(params.id)
    await zone.delete()
    return response.status(204)
  }
}