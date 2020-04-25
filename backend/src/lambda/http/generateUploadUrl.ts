import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { HomeItem } from '../../models/HomeItem'
import { HomeRepository } from '../../repository/HomeRepository'
import { createLogger } from '../../utils/logger'
import { parseUserIdHeader } from '../../auth/utils'
import { AttachmentStorage } from '../../storage/AttachmentStorage'
import cors from '@middy/http-cors'
import { PhotoRepository } from '../../repository/PhotoRepository'
import * as uuid from 'uuid'

const homeRepository: HomeRepository = new HomeRepository()
const photoRepository: PhotoRepository = new PhotoRepository()

const storage: AttachmentStorage = new AttachmentStorage()
const logger = createLogger('generateUrlHome')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const homeId = event.pathParameters.homeId
  logger.info(`Generate request for ${homeId}`)
  const item: HomeItem = await homeRepository.find(homeId)
  const authHeader = event.headers['Authorization']
  const userId = parseUserIdHeader(authHeader)

  if (!item) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        'message': 'item not found'
      })
    }
  }

  if (userId !== item.userId) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        'message': 'No permissions on the item'
      })
    }
  }

  const photoUuid = uuid.v4();
  const url = await storage.getUploadUrl(photoUuid)
  if (!item.previewImage) {
    item.previewImage = photoUuid
    await homeRepository.update(item)
  }

  await photoRepository.create(photoUuid, homeId)

  logger.info(`Generated url for ${homeId}`)

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: url
    })
  }
})

handler.use(cors())
