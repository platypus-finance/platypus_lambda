# Platypus Lambda

This repository stores all of the AWS Lambda functions used by Platypus Dapp.

## Deployed Functions

Endpoints:
```
current_time:  GET - https://yr3ejhev7i.execute-api.us-east-1.amazonaws.com/prod/current_time
circulating_supply:  GET - https://yr3ejhev7i.execute-api.us-east-1.amazonaws.com/prod/circulating_supply
```

## Deployment

```sh
sls deploy
# or
sls deploy --aws-profile [your-aws-cli-profile]
```

After deployment, remember to enable CORS in API Gateway settings. See https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors-console.html and https://www.serverless.com/blog/cors-api-gateway-survival-guide/
