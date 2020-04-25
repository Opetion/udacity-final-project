import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { HomeRepository } from '../../repository/HomeRepository'
import { createLogger } from '../../utils/logger'
import cors from '@middy/http-cors'
import { AttachmentStorage } from '../../storage/AttachmentStorage'
import { HomeItem } from '../../models/HomeItem'

const repository: HomeRepository = new HomeRepository()
const storage: AttachmentStorage = new AttachmentStorage()

const logger = createLogger('getHome')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const homeId = event.pathParameters.homeId

  let result: HomeItem = await repository.find(homeId)

  logger.info(`Get Details ${homeId} -> ${result}`)
  if (result.previewImage) {
    result.previewImage = await storage.getAttachment(result.homeId)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      result
    })
  }
})

handler.use(cors())
