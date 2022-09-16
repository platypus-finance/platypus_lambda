const fetch = require("node-fetch");
const COIN_MARKET_CAP_API =
  "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest";

module.exports.cmcPrice = async (event) => {
  let id = "";
  let responseCode = 200;
  let finalResult = "";

  if (event.queryStringParameters && event.queryStringParameters.id) {
    id = event.queryStringParameters.id;
  }

  try {
    const cmcData = await fetch(`${COIN_MARKET_CAP_API}?id=${id}`, {
      method: "GET",
      headers: {
        "X-CMC_PRO_API_KEY": "714bbf0f-a0ce-4bd3-85d2-5b291eef395c",
        "Access-Control-Allow-Origin": "*",
        "content-type": "application/json",
      },
    });
    const result = await cmcData.json();
    finalResult = Object.values(result.data).reduce((res, item) => {
      return {
        ...res,
        [item.id]: {
          percent_change_24h: item["quote"]["USD"]["percent_change_24h"],
          price: item["quote"]["USD"]["price"],
        },
      };
    }, {});
  } catch (error) {
    responseCode = 400;
  }

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
