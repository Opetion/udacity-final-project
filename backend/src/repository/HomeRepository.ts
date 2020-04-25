import * as uuid from 'uuid'
import {CreateHomeRequest} from "../requests/CreateHomeRequest";
import {HomeItem} from "../models/HomeItem";
import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger("home-repository");

export class HomeRepository {

    constructor(
        private readonly docClient = createDynamoDBClient(),
        private readonly HOME_USER_INDEX = process.env.HOME_USER_INDEX,
        private readonly HOME_TABLE = process.env.HOME_TABLE) {
    }

    async getAll(): Promise<HomeItem[]> {
        //todo: create pagination
        const result = await this.docClient.scan({
            TableName : this.HOME_TABLE,
        }).promise();

        const items = result.Items;
        logger.info(result);
        return items as HomeItem[];
    }

    async getAllFromUser(userId: string): Promise<HomeItem[]> {

        const result = await this.docClient.query({
            TableName : this.HOME_TABLE,
            IndexName: this.HOME_USER_INDEX,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();


        const items = result.Items;
        logger.info(result);
        return items as HomeItem[];
   }

    async find(id: string): Promise<HomeItem> {

        const params = {
            TableName: this.HOME_TABLE,
            Key: {
                "homeId": id
            }
        };

        const result = await this.docClient.get(params).promise();

        const item = result.Item;
        logger.info(`ID: ${id} -> ${item}`);

        return item as HomeItem;
    }

    async delete(homeId: string) : Promise<void> {
        const params = {
            TableName: this.HOME_TABLE,
            Key:{
                "homeId": homeId
            }
        };

        await this.docClient.delete(params).promise();
    }

    async update(request: HomeItem): Promise<HomeItem> {
        const params = {
            TableName: this.HOME_TABLE,
            Item: request
        };

        await this.docClient.put(params).promise();

        return request;
    }


    async create(request: CreateHomeRequest, userId: string): Promise<HomeItem> {
        const item: HomeItem = {
            userId: userId,
            homeId: uuid.v4(),
            createdAt: new Date().toISOString(),
            name: request.name,
            description: request.description
        };

        const params = {
            TableName: this.HOME_TABLE,
            Item: item
        }

        await this.docClient.put(params).promise();

        return item;
    }

}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }
    return new XAWS.DynamoDB.DocumentClient()
}


