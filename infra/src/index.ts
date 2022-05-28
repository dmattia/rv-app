import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

const bucket = new aws.s3.Bucket('website-contents', {
  bucket: `rv-app-origin-bucket`,
  acl: 'public-read',
  website: {
    indexDocument: 'index.html',
    errorDocument: 'index.html',
  },
  policy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::rv-app-origin-bucket/*`],
      },
    ],
  }),
});

const map = new aws.location.Map('main-map', {
  mapName: 'rv-app-primary',
  description: 'Primary map for the app',
  configuration: {
    style: 'VectorHereExploreTruck',
  }
})

export const bucketName = bucket.bucket;
export const bucketUrl = pulumi.interpolate`https://${bucket.bucketDomainName}/index.html`;
export const mapName = map.mapName;
