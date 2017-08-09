github-lambda-s3-publisher
==========================

## Dependencies
github-lambda-s3-publisher requires node.js, git, awscli, and the [serverless framework](https://serverless.com/). Feel free to install these packages any way that you'd like.
   * One Liners: 
       * Mac: `brew install node git awscli`
       * Windows: `bchoco install nodejs.install git awscli`
       * Ubuntu: `sudo apt-get install nodejs git awscli`
   * Make sure that your aws client is configured with `aws configure`

## Setup
```bash
# Install the serverless framework globally
npm install -g serverless 

# Clone the repo
git clone https://github.com/nick123pig/github-lambda-s3-publisher.git 
cd github-lambda-s3-publisher

# Install the dependencies
npm install

# Copy the default configuration
cp config.default.yml config.yml

# Deploy out!
serverless deploy
```

After that, check your AWS account for the newly created SNS topic, and then add it to your github.
