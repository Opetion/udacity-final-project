import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateHomeRequest } from '../../requests/UpdateHomeRequest'
import * as middy from "middy";
import { HomeItem } from '../../models/HomeItem'
import { parseUserIdHeader } from '../../auth/utils'
import { HomeRepository } from '../../repository/HomeRepository'
import { createLogger } from '../../utils/logger'
import cors from '@middy/http-cors'

const repository: HomeRepository = new HomeRepository();
const logger = createLogger("updateHome");

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const homeId = event.pathParameters.homeId
  const updatedHome: UpdateHomeRequest = JSON.parse(event.body)

  const item : HomeItem = await repository.find(homeId);
  const authHeader = event.headers["Authorization"];
  const userId = parseUserIdHeader(authHeader);

  if(!item){
    return  {
      statusCode: 404,
      body: JSON.stringify({
        "message":"item not found"
      })
    };
  }

  if(userId !== item.userId) {
    return  {
      statusCode: 403,
      body: JSON.stringify({
        "message":"No permissions on the item"
      })
    };
  }
  item.name = updatedHome.name

  const result = await repository.update(item)
  logger.info(`Updated Home [${userId}] with ${item}`);
  return {
    statusCode:200,
    body: JSON.stringify({
      result
    })
  };
});

handler.use(cors());
