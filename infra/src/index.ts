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

export const bucketName = bucket.bucket;
export const bucketUrl = pulumi.interpolate`https://${bucket.bucketDomainName}/index.html`;
