const { Sequelize, Op } = require('sequelize');
const { Wallet, Transaction } = require('../../models');
const ApiError = require('../../utils/ApiError');

class WalletService {
  async getOrCreate(userId) {
    let wallet = await Wallet.findOne({ where: { user_id: userId } });
    if (!wallet) wallet = await Wallet.create({ user_id: userId, balance: 0 });
    return wallet;
  }

  async getBalance(userId) {
    const wallet = await this.getOrCreate(userId);
    return wallet;
  }

  async charge(userId, amount, reason = 'Top-up', reference = null) {
    if (amount <= 0) throw new ApiError(400, 'Amount must be positive');
    return Wallet.sequelize.transaction(async (t) => {
      const wallet = await Wallet.findOne({
        where: { user_id: userId },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });
      if (!wallet) throw new ApiError(404, 'Wallet not found');
      const before = parseFloat(wallet.balance);
      const after = before + parseFloat(amount);
      await wallet.update({ balance: after }, { transaction: t });
      await Transaction.create(
        {
          wallet_id: wallet.id,
          type: 'charge',
          amount,
          balance_before: before,
          balance_after: after,
          reason,
          reference_type: reference?.type,
          reference_id: reference?.id,
        },
        { transaction: t },
      );
      return { wallet, balance: after };
    });
  }

  /**
   * Deduct amount from a student wallet inside a row-locked transaction.
   * Throws if insufficient balance.
   */
  async deduct(userId, amount, reason, reference = null) {
    if (amount <= 0) throw new ApiError(400, 'Amount must be positive');
    return Wallet.sequelize.transaction(async (t) => {
      const wallet = await Wallet.findOne({
        where: { user_id: userId },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });
      if (!wallet) throw new ApiError(404, 'Wallet not found');
      const before = parseFloat(wallet.balance);
      if (before < parseFloat(amount)) {
        throw new ApiError(402, 'Insufficient balance', {
          balance: before,
          required: amount,
        });
      }
      const after = before - parseFloat(amount);
      await wallet.update({ balance: after }, { transaction: t });
      const tx = await Transaction.create(
        {
          wallet_id: wallet.id,
          type: 'deduct',
          amount,
          balance_before: before,
          balance_after: after,
          reason,
          reference_type: reference?.type,
          reference_id: reference?.id,
        },
        { transaction: t },
      );
      return { wallet, balance: after, transaction: tx };
    });
  }

  async refund(userId, amount, reason, reference = null) {
    return this.charge(userId, amount, reason || 'Refund', reference);
  }

  async history(userId, { limit, offset, type }) {
    const wallet = await this.getOrCreate(userId);
    const where = { wallet_id: wallet.id };
    if (type) where.type = type;
    const { rows, count } = await Transaction.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
    return { rows, count };
  }
}

module.exports = new WalletService();
