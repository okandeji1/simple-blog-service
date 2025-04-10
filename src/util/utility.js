export const buildResponse = (
  response,
  statusCode,
  data,
  preTag = 'Response',
) => {
  return response.format({
    'application/json': () => {
      response
        .status(statusCode)
        .json({ ...data, timestamp: new Date().toJSON(), statusCode });
    },
    default: () => {
      // log the request and respond with 406
      response.status(406).send('Not Acceptable');
    },
    preTag,
  });
};

export const paginationSchema = () => ({
  query: {
    limit: joi.number().min(0).max(1000).default(10),
    page: joi.number().min(1).default(1),
  },
});