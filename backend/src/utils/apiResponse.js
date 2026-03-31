function success(message, data = null) {
  return {
    success: true,
    message,
    data
  };
}

function failure(message, data = null) {
  return {
    success: false,
    message,
    data
  };
}

module.exports = {
  success,
  failure
};
