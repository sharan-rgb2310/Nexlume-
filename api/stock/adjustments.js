import { createRenderStockProxy } from '../../serverless/renderStockProxy.js'

export default createRenderStockProxy({
  method: 'POST',
  path: '/api/stock/adjustments',
  write: true,
})
