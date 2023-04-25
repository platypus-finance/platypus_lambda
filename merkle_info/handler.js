// Load the AWS SDK
const AWS = require("aws-sdk");

// Set region and credentials for DynamoDB
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_REGION,
  secretAccessKey: process.env.AWS_REGION,
});

// Create the DynamoDB service object
const dynamoClient = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION, // replace with your desired region
});
const tableName = "platypus-airdrop-claims";
const transferRes = async (responses) => {
  return responses.reduce((prev, curr) => {
    const compaignAddress = curr.compaignAddress_userAddress.split("_")[0];
    const { index, amount, proof } = curr;
    return {
      ...prev,
      [compaignAddress]: { index, amount, proof },
    };
  }, {});
};
const getDocuments = async (compaignAddress_userAddresses) => {
  const params = {
    RequestItems: {
      [tableName]: {
        Keys: compaignAddress_userAddresses.map(
          (compaignAddress_userAddress) => ({
            compaignAddress_userAddress,
          })
        ),
      },
    },
  };
  const responses =
    (await dynamoClient.batchGet(params).promise()).Responses?.[tableName] ||
    [];
  return transferRes(responses);
};

module.exports.merkle_info = async (event) => {
  // Retrieve the Item ID from the event object
  const compaignAddress_userAddresses = JSON.parse(event.body);
  // Call the DynamoDB getItem method to retrieve the item
  try {
    if (!compaignAddress_userAddresses) {
      throw "compaignAddress_userAddresses is empty";
    }
    const result = await getDocuments(compaignAddress_userAddresses);

    console.log(
      `Get User Claims: ${compaignAddress_userAddresses[0].split("_")[1]}`
    ); // Log the retrieved item to CloudWatch Logs

    // Return the retrieved item as the response to the Lambda invocation
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
      },
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error(err);
    // If there was an error retrieving the item, return an error response
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
      },
      body: JSON.stringify({
        message: "Error retrieving item from DynamoDB",
        error: err,
      }),
    };
  }
};
