const isRequestBodyAnObject = (req, res, next) => {
  if (Object.keys(req.body).length > 0) {
    if (typeof req.body === 'object') {
      return next();
    }

    return res
      .status(400)
      .json({ message: 'Request body is expected to be an object' });
  }
  next();
};

module.exports = {
  isRequestBodyAnObject,
};
