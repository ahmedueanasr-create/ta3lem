const express = require('express');
const auth = require('../../middleware/auth');
const { checkRole } = require('../../middleware/rbac');
const asyncHandler = require('../../utils/asyncHandler');
const { paginate, paginateResponse } = require('../../utils/paginate');
const { Subject } = require('../../models');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const ROLES = require('../../utils/roles');

const router = express.Router();
router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  const { limit, offset, page } = paginate(req);
  const { rows, count } = await Subject.findAndCountAll({
    where: { is_active: req.query.include_inactive ? undefined : true },
    limit,
    offset,
    order: [['id', 'ASC']],
  });
  res.json({ success: true, ...paginateResponse(rows, count, page, limit) });
}));

router.post(
  '/',
  checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  [body('name').trim().isLength({ min: 2 }), validate],
  asyncHandler(async (req, res) => {
    const slug = req.body.name.trim().toLowerCase().replace(/\s+/g, '-');
    const subject = await Subject.create({ ...req.body, slug });
    res.status(201).json({ success: true, data: subject });
  }),
);

router.put(
  '/:id',
  checkRole(ROLES.PLATFORM_ADMIN, ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Not found' });
    await subject.update(req.body);
    res.json({ success: true, data: subject });
  }),
);

module.exports = router;
