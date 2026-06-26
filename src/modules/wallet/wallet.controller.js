const asyncHandler = require('../../utils/asyncHandler');
const walletService = require('./wallet.service');
const { paginate, paginateResponse } = require('../../utils/paginate');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const { checkRole } = require('../../middleware/rbac');

exports.me = asyncHandler(async (req, res) => {
  const wallet = await walletService.getBalance(req.user.id);
  res.json({ success: true, data: wallet });
});

exports.history = asyncHandler(async (req, res) => {
  const { limit, offset, page } = paginate(req);
  const { rows, count } = await walletService.history(req.user.id, {
    limit,
    offset,
    type: req.query.type,
  });
  res.json({ success: true, ...paginateResponse(rows, count, page, limit) });
});

const chargeRules = [body('amount').isFloat({ gt: 0 }), body('reason').optional().isString(), validate];

exports.charge = [checkRole('platform_admin', 'student'), chargeRules, asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;
  const { wallet, balance } = await walletService.charge(req.user.id, amount, reason || 'Top-up');
  res.json({ success: true, data: { wallet, balance } });
})];
