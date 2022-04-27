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

