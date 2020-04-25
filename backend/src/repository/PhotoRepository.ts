
import {PhotoItem} from "../models/PhotoItem";
import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger("photo-repository");

export class PhotoRepository {

    constructor(
        private readonly docClient = createDynamoDBClient(),
        private readonly PHOTO_HOME_INDEX = process.env.PHOTO_HOME_INDEX,
        private readonly PHOTO_TABLE = process.env.PHOTO_TABLE) {
    }

    async getAllFromHouseId(homeId: string): Promise<PhotoItem[]> {
        const result = await this.docClient.query({
            TableName : this.PHOTO_TABLE,
            IndexName: this.PHOTO_HOME_INDEX,
            KeyConditionExpression: 'homeId = :homeId',
            ExpressionAttributeValues: {
                ':homeId': homeId
            }
        }).promise();

        const items = result.Items;
        logger.info(result);
        return items as PhotoItem[];
   }

    async delete(photoId: string) : Promise<void> {
        const params = {
            TableName: this.PHOTO_TABLE,
            Key:{
                "photoId": photoId
            }
        };

        await this.docClient.delete(params).promise();
    }

    async create(photoId: string, homeId: string): Promise<PhotoItem> {
        const item: PhotoItem = {
            homeId: homeId,
            photoId: photoId,
            createdAt: new Date().toISOString()
        };

        const params = {
            TableName: this.PHOTO_TABLE,
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


