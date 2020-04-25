import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateHomeRequest } from '../../requests/CreateHomeRequest'
import {parseUserIdHeader} from "../../auth/utils";
import {createLogger} from "../../utils/logger";
import {HomeRepository} from "../../repository/HomeRepository";
import {HomeItem} from "../../models/HomeItem";

import * as middy from 'middy'
import cors from '@middy/http-cors'

const repository: HomeRepository = new HomeRepository();
const logger = createLogger("createHome");

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newHome: CreateHomeRequest = JSON.parse(event.body);
  const authHeader = event.headers["Authorization"];
  const userId = parseUserIdHeader(authHeader);
  logger.info(`Create Home [${userId}]  with ${JSON.stringify(newHome)}`);
  const result : HomeItem = await repository.create(newHome, userId);
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item:result
    })
  }
});

handler.use(cors());
