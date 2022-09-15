const fetch = require("node-fetch");
const COIN_MARKET_CAP_API =
  "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest";

module.exports.cmcPrice = async (event, context, callback) => {
  let id = "";
  let aux = "";
  let responseCode = 200;

  if (event.queryStringParameters && event.queryStringParameters.id) {
    id = event.queryStringParameters.id;
  }

  if (event.queryStringParameters && event.queryStringParameters.aux) {
    aux = event.queryStringParameters.aux;
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

  const finalResult = Object.values(result.data).reduce((res, item) => {
    return {
      ...res,
      [item.id]: {
        percent_change_24h: item["quote"]["USD"]["percent_change_24h"],
        price: item["quote"]["USD"]["price"],
      },
    };
  }, {});

  let response = {
    statusCode: responseCode,
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(finalResult),
  };

  callback(null, response);
};
