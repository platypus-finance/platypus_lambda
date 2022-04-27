module.exports.currentTime = (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
    body: String(Math.round(new Date().getTime() / 1000)),
  };

  callback(null, response);
};
