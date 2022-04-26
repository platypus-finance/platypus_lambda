module.exports.currentTime = (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: String(Math.round(new Date().getTime() / 1000)),
  };

  callback(null, response);
};
