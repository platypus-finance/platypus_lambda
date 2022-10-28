const totalSupply = async (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
    body: "300000000",
  };

  callback(null, response);
};

module.exports.totalSupply = totalSupply;
