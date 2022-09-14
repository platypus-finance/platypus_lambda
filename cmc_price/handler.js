const fetch = require("node-fetch");
const COIN_MARKET_CAP_API =
  "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest";

module.exports.cmcPrice = async (event, context, callback) => {
  let id = "";
  let responseCode = 200;

  if (event.queryStringParameters && event.queryStringParameters.id) {
    id = event.queryStringParameters.id;
  }

  const cmcData = await fetch(`${COIN_MARKET_CAP_API}?id=${id}`, {
    method: "GET",
    headers: {
      "X-CMC_PRO_API_KEY": "714bbf0f-a0ce-4bd3-85d2-5b291eef395c",
      "Access-Control-Allow-Origin": "*",
      "content-type": "application/json",
    },
  });

  const result = await cmcData.json();

  let response = {
    statusCode: responseCode,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify(result),
  };

  callback(null, response);
};
