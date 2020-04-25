import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const bucketName = process.env.ATTACHMENTS_S3_BUCKET

const EXPIRE_TIME = 300;
const XAWS = AWSXRay.captureAWS(AWS);

const STORAGE = new XAWS.S3({
  signatureVersion: 'v4',
  region: process.env.REGION,
  params: {Bucket: bucketName}
});

export class AttachmentStorage{

  constructor(){
  };

  async getUploadUrl(uuid:string) : Promise<string> {
    return STORAGE.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: `${uuid}.png`,
      Expires: EXPIRE_TIME
    })
  };

  async getAttachment(uuid: string) : Promise<string> {
    return STORAGE.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: `${uuid}.png`,
      Expires: EXPIRE_TIME
    })
  }
}
