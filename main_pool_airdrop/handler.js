const { ethers } = require("ethers");
const path = require("path");
var fs = require("fs");

module.exports.mainPoolAirdrop = async (event) => {
  const message =
    "Please sign this message to access the info of your compensation regarding the USP hack.";
  const wallet = ethers.Wallet.createRandom();
  let signature = await wallet.signMessage(message);
  var data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "users.json"), "utf8")
  );
  const responseCode = 200;
  if (event.queryStringParameters && event.queryStringParameters.signature) {
    signature = event.queryStringParameters.signature;
  }
  const address = ethers.verifyMessage(message, signature);
  let user = null;
  if (address) {
    user = data["users"][address.toLowerCase()];
  }
  const result = {
    market: data["market"],
    ...user,
  };
  const response = {
    statusCode: responseCode,
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(result),
  };

  return response;
};
