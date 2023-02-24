const { ethers } = require("ethers");
const path = require("path");
let csvToJson = require("convert-csv-to-json");
module.exports.mainPoolAirdrop = async (event) => {
  const message = "Please sign to read your airdrop.";
  const wallet = ethers.Wallet.createRandom();
  let signature = await wallet.signMessage(message);
  let users = csvToJson
    .fieldDelimiter(",")
    .getJsonFromCsv(path.join(__dirname, "users.csv"));
  const responseCode = 200;
  if (event.queryStringParameters && event.queryStringParameters.signature) {
    signature = event.queryStringParameters.signature;
  }
  const address = ethers.verifyMessage(message, signature);
  let user = null;
  if (address) {
    user = users.filter(
      (data) => data["address"].toLowerCase() === address.toLowerCase()
    )[0];
  }
  const response = {
    statusCode: responseCode,
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(user),
  };

  return response;
};
