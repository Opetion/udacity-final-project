import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'

import { createLogger } from '../../utils/logger'
import cors from '@middy/http-cors'
import { AttachmentStorage } from '../../storage/AttachmentStorage'
import { PhotoRepository } from '../../repository/PhotoRepository'
import { PhotoItem } from '../../models/PhotoItem'


const photoRepository: PhotoRepository = new PhotoRepository()

const storage: AttachmentStorage = new AttachmentStorage()
const logger = createLogger('getHome')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const homeId = event.pathParameters.homeId

  logger.info(`Get All Photos from ${homeId}`)

  let photos: PhotoItem[] = await photoRepository.getAllFromHouseId(homeId)

  logger.info(`${homeId} -> ${photos.length}`)
  let result = await Promise.all(photos.map(async (photo) => {
    photo.url = await storage.getAttachment(photo.photoId)
    return photo
  }))
  logger.info(`${result}`)

  return {
    statusCode: 200,
    body: JSON.stringify({
      result
    })
  }
})

handler.use(cors())
