const { ethers } = require("ethers");
module.exports.mainPoolAirdrop = async (event) => {
  const message = "Please sign to read your airdrop.";
  const wallet = ethers.Wallet.createRandom();
  let signature = await wallet.signMessage(message);
  const responseCode = 200;
  if (event.queryStringParameters && event.queryStringParameters.signature) {
    signature = event.queryStringParameters.signature;
  }
  const finalResult = {
    address: ethers.verifyMessage(message, signature),
    uspBalance: 0,
    usdteLpBalance: 0,
    usdceLpBalance: 0,
    daieLpBalance: 0,
    usdcLpBalance: 0,
    usdtLpBalance: 0,
    busdLpBalance: 0,
  };
  const response = {
    statusCode: responseCode,
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(finalResult),
  };

  return response;
};
