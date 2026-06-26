const paginate = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const paginateResponse = (rows, count, page, limit) => ({
  data: rows,
  meta: {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit) || 1,
  },
});

module.exports = { paginate, paginateResponse };
