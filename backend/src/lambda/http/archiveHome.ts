import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import * as middy from "middy";
import { HomeRepository } from '../../repository/HomeRepository'
import { HomeItem } from '../../models/HomeItem'
import { parseUserIdHeader } from '../../auth/utils'
import cors from '@middy/http-cors'

const repository: HomeRepository = new HomeRepository();
const logger = createLogger("deleteHome");

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const homeId = event.pathParameters.homeId
  const authHeader = event.headers["Authorization"];
  const userId = parseUserIdHeader(authHeader);

  if (!homeId) {
    return  {
      statusCode: 400,
      body: JSON.stringify({
        "message":"missing parameters"
      })
    };
  }

  const item : HomeItem = await repository.find(homeId);
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
        "message":"No permissions to delete the item"
      })
    };
  }

  await repository.delete(homeId);

  logger.info(`Delete TODO [${userId}]  with id: ${homeId}`);
  return {
    statusCode: 200,
    body:JSON.stringify({
      "message":"Item deleted successfully"
    })
  };
});

handler.use(cors());
