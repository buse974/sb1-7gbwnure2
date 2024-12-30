import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.group(() => {
  router.get('zones', '#controllers/zones_controller.index')
  router.post('zones', '#controllers/zones_controller.store')
  router.get('zones/:id', '#controllers/zones_controller.show')
  router.put('zones/:id', '#controllers/zones_controller.update')
  router.delete('zones/:id', '#controllers/zones_controller.destroy')
}).middleware(['auth'])

export default router