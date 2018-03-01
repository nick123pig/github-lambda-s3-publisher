'use strict';

const s3 = require('s3');
const download = require('download-git-repo');
const rmdir = require('rmdir');
const AWS = require('aws-sdk');
const series = require('async/series');
const slack = require('slack-notify')(process.env.SLACK_WEBHOOK_URL);

const s3Client = s3.createClient();

const invalidateCloudfront = (cb) => {
  const cloudfront = new AWS.CloudFront({apiVersion: '2017-03-25'});

  var cfParams = {
    DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
    InvalidationBatch: {
      CallerReference: Math.round(+new Date()/1000)+'',
      Paths: {
        Quantity: 1,
        Items: ['/*']
      }
    }
  };

  cloudfront.createInvalidation(cfParams, (err, data)=> {
    cb(err,data);
  });

}

const notifySlack = (revision,cb) => {
  const message = `Revision ${revision} has been successfully published to ${process.env.S3_DESTINATION_BUCKET}`
  slack.send({text:message,username: 'Website Publisher'} ,err => {
    cb(err,message);
  });
}

const cleanUpLocalDir = (revision,cb) => {
  rmdir(`/tmp`, err => {
    if (err) cb(err);
    else cb(null,"Deleted tmp files");
  });
}

const cleanupTasks = (revision, lambdaDone) => {
  let tasks = [cb=>cleanUpLocalDir(revision,cb)];
  const {CLOUDFRONT_DISTRIBUTION_ID,SLACK_WEBHOOK_URL} = process.env;
  if (CLOUDFRONT_DISTRIBUTION_ID) tasks.push(cb=>invalidateCloudfront(cb));
  if (SLACK_WEBHOOK_URL) tasks.push(cb=>notifySlack(revision, cb));
  series(tasks, (err,results)=> {
    lambdaDone(err,results);
  });
}

const uploadToS3 = (revision,lambdaDone) => {
  const {GIT_WEBSITE_PREFIX_PATH, S3_DESTINATION_BUCKET} = process.env;
  const uploadParams = {
    localDir: (GIT_WEBSITE_PREFIX_PATH ? `/tmp/${GIT_WEBSITE_PREFIX_PATH}` : `/tmp`),
    deleteRemoved: true,
    s3Params: {Bucket: S3_DESTINATION_BUCKET},
  };
  const uploader = s3Client.uploadDir(uploadParams);
  uploader.on('error', err => lambdaDone(err));
  uploader.on('end', () => {
    cleanupTasks(revision,lambdaDone);
  });
}

const downloadRepo = (snsObj,lambdaDone) => {
  download(snsObj.repository.full_name, `/tmp`, (err,res) =>  {
    if (err) lambdaDone(err);
    else uploadToS3(snsObj.head_commit.id,lambdaDone);
  });
}

module.exports.githubListen = (event, context, lambdaDone) => {
  const snsObj = JSON.parse(event.Records[0].Sns.Message);
  if (snsObj.ref === "refs/heads/master") downloadRepo(snsObj,lambdaDone);
  else lambdaDone(null, "Nothing published to master");
};
