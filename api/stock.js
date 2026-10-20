import { createRenderStockProxy } from '../serverless/renderStockProxy.js'

export default createRenderStockProxy({
  method: 'GET',
  path: '/api/stock',
})
