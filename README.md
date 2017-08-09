github-lambda-s3-publisher
==========================

1. Install node.js, git, and awscli `brew install node git awscli`
2. Install serverless `npm install -g serverless`
3. Clone `git clone {this repo} && cd github-lambda-s3-publisher`
4. Install dependencies `npm install`
4. Configure your aws cli `aws configure`
5. Copy the default config `cp config.default.yml config.yml`
6. Edit `config.yml` with your values
7. Deploy `serverless deploy`
8. Log into your AWS account, find the SNS topic ARN, and put that into github
