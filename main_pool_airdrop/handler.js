const { ethers } = require("ethers");
const path = require("path");
var fs = require("fs");

module.exports.mainPoolAirdrop = async (event) => {
  const MESSSAGE =
    "Please sign this message to access the info of your compensation regarding the USP hack.";

  try {
    var data = JSON.parse(
      fs.readFileSync(path.join(__dirname, "users.json"), "utf8")
    );
    const responseCode = 200;
    let signature = "";
    if (event.queryStringParameters && event.queryStringParameters.signature) {
      signature = event.queryStringParameters.signature;
    }
    const address = ethers.verifyMessage(MESSSAGE, signature);
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
  } catch (err) {
    const response = {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(err),
    };

    return response;
  }
};
