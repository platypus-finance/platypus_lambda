# Platypus Lambda

This repository stores all of the AWS Lambda functions used by Platypus Dapp. It is maintained by the [Serverless framework](https://www.serverless.com/).

## Deployed Functions

Endpoints:

```
current_time:  GET - https://yr3ejhev7i.execute-api.us-east-1.amazonaws.com/prod/current_time
circulating_supply:  GET - https://yr3ejhev7i.execute-api.us-east-1.amazonaws.com/prod/circulating_supply
cmc_price: GET - https://elzgxr8iga.execute-api.us-east-1.amazonaws.com/dev/cmc_price
```

## Local Testing

Enable API Gateway locally

```sh
serverless offline start
```

## Development

Install the Serverless framework CLI.

```sh
npm install -g serverless
```

## Deployment

Set up AWS CLI and configure your AWS credentials.

```sh
# cd to repo root
sls deploy
# or
sls deploy --aws-profile [your-aws-cli-profile]
# deploy to different stage
sls deploy --stage [prod/dev]
```

After deployment, remember to enable CORS in API Gateway settings. See https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors-console.html and https://www.serverless.com/blog/cors-api-gateway-survival-guide/

## Environment Variables

TBD
