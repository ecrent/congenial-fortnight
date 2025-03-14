const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        details: error.details.map(err => err.message).join(', ')
      });
    }
    next();
  };
};

module.exports = {
  validate
};
