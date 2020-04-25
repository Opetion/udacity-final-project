import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { parseUserIdHeader } from '../../auth/utils'
import { HomeRepository } from '../../repository/HomeRepository'
import { createLogger } from '../../utils/logger'
import cors from '@middy/http-cors'
import { AttachmentStorage } from '../../storage/AttachmentStorage'
import { HomeItem } from '../../models/HomeItem'

const repository: HomeRepository = new HomeRepository()
const storage: AttachmentStorage = new AttachmentStorage()
const logger = createLogger('indexHome')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let ownerParam : boolean = false;
  if(event.queryStringParameters && event.queryStringParameters.owner){
    ownerParam = event.queryStringParameters.owner.toLowerCase() == "true"
  }
  console.log(`[Self]: ${ownerParam}`)

  let result: HomeItem[]
  if (ownerParam) {
    const authHeader = event.headers['Authorization']
    const userId = parseUserIdHeader(authHeader)
    result = await repository.getAllFromUser(userId)
    logger.info(`Self Index HOME [${userId}] with ${result}`)
  } else {
    result = await repository.getAll()
    logger.info(`All Index HOME with ${result}`)
  }


  for (const item of result) {
    if (!item.previewImage) {
      continue
    }
    item.previewImage = await storage.getAttachment(item.previewImage)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: result
    })
  }
})

handler.use(cors())
