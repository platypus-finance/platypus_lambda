// Load the AWS SDK
const AWS = require("aws-sdk");

// Set region and credentials for DynamoDB
AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

// Create the DynamoDB service objects
const dynamoClient = new AWS.DynamoDB.DocumentClient({
  region: process.env.REGION, // replace with your desired region
});
const tableName = "platypus-airdrop-claims";
const transferRes = async (responses) => {
  return responses.reduce((prev, curr) => {
    const campaignAddress = curr.campaignAddress_userAddress.split("_")[0];
    const { index, amount, proof } = curr;
    return {
      ...prev,
      [campaignAddress]: { index, amount, proof },
    };
  }, {});
};
const getDocuments = async (campaignAddress_userAddresses) => {
  const params = {
    RequestItems: {
      [tableName]: {
        Keys: campaignAddress_userAddresses.map(
          (campaignAddress_userAddress) => ({
            campaignAddress_userAddress,
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
  const campaignAddress_userAddresses = JSON.parse(event.body);
  // Call the DynamoDB getItem method to retrieve the item
  try {
    if (!campaignAddress_userAddresses) {
      throw "campaignAddress_userAddresses is empty";
    }
    const result = await getDocuments(campaignAddress_userAddresses);
    const userAddress = campaignAddress_userAddresses[0]
      .split("_")[1]
      .toLowerCase();
    console.log(`Get User Claims: ${userAddress}`); // Log the retrieved item to CloudWatch Logs

    // Return the retrieved item as the response to the Lambda invocation
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
      },
      body: JSON.stringify({
        userAddress,
        result,
      }),
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
