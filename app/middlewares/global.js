const isRequestBodyAnObject = (req, res, next) => {
  if (typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }

  return res
    .status(400)
    .json({ message: 'Request body is expected to be an object' });
};

module.exports = {
  isRequestBodyAnObject,
};
