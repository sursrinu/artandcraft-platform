// Vendor Payout Controller
import { VendorPayoutService } from '../services/vendorPayoutService.js';
import { VendorBankAccountService } from '../services/vendorBankAccountService.js';

let vendorPayoutService;
let vendorBankAccountService;

export const initPayoutController = (db) => {
  vendorPayoutService = new VendorPayoutService(db);
  vendorBankAccountService = new VendorBankAccountService(db);
};

/**
 * Calculate payout for vendor in a period
 */
export const calculatePayout = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
    }

    const calculation = await vendorPayoutService.calculatePayoutForVendor(
      vendorId,
      new Date(startDate),
      new Date(endDate)
    );

    res.status(200).json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request payout
 */
export const requestPayout = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const { startDate, endDate, notes } = req.body;

    const payout = await vendorPayoutService.createPayout(vendorId, {
      startDate,
      endDate,
      notes,
    });

    res.status(201).json({
      success: true,
      data: payout,
      message: 'Payout request created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vendor payouts
 */
export const getVendorPayouts = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const { page = 1, per_page = 20, status } = req.query;

    const result = await vendorPayoutService.getVendorPayouts(vendorId, {
      page: parseInt(page),
      perPage: parseInt(per_page),
      status,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all payouts (admin)
 */
export const getAllPayouts = async (req, res, next) => {
  try {
    const { page = 1, per_page = 20, status, vendorId } = req.query;

    const result = await vendorPayoutService.getAllPayouts({
      page: parseInt(page),
      perPage: parseInt(per_page),
      status,
      vendorId: vendorId ? parseInt(vendorId) : null,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payout details
 */
export const getPayoutById = async (req, res, next) => {
  try {
    const { payoutId } = req.params;

    const payout = await vendorPayoutService.getPayoutById(parseInt(payoutId));

    res.status(200).json({
      success: true,
      data: payout,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update payout status (admin)
 */
export const updatePayoutStatus = async (req, res, next) => {
  try {
    const { payoutId } = req.params;
    const { status, transactionId, failureReason } = req.body;
    const adminId = req.user.userId;

    const payout = await vendorPayoutService.updatePayoutStatus(
      parseInt(payoutId),
      status,
      adminId,
      { transactionId, failureReason }
    );

    res.status(200).json({
      success: true,
      data: payout,
      message: 'Payout status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add deductions to payout (admin)
 */
export const addDeduction = async (req, res, next) => {
  try {
    const { payoutId } = req.params;
    const { amount, reason } = req.body;

    const payout = await vendorPayoutService.addDeductions(
      parseInt(payoutId),
      parseFloat(amount),
      reason
    );

    res.status(200).json({
      success: true,
      data: payout,
      message: 'Deduction added successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel payout
 */
export const cancelPayout = async (req, res, next) => {
  try {
    const { payoutId } = req.params;
    const { reason } = req.body;

    const payout = await vendorPayoutService.cancelPayout(
      parseInt(payoutId),
      reason
    );

    res.status(200).json({
      success: true,
      data: payout,
      message: 'Payout cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payout statistics
 */
export const getPayoutStats = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;

    const stats = await vendorPayoutService.getPayoutStats(vendorId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add vendor bank account
 */
export const addBankAccount = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const accountData = req.body;

    const account = await vendorBankAccountService.addBankAccount(
      vendorId,
      accountData
    );

    res.status(201).json({
      success: true,
      data: account,
      message: 'Bank account added successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vendor bank accounts
 */
export const getBankAccounts = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;

    const accounts = await vendorBankAccountService.getVendorBankAccounts(vendorId);

    res.status(200).json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update bank account
 */
export const updateBankAccount = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const { accountId } = req.params;
    const updateData = req.body;

    const account = await vendorBankAccountService.updateBankAccount(
      parseInt(accountId),
      vendorId,
      updateData
    );

    res.status(200).json({
      success: true,
      data: account,
      message: 'Bank account updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set primary bank account
 */
export const setPrimaryBankAccount = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const { accountId } = req.params;

    const account = await vendorBankAccountService.setPrimaryBankAccount(
      parseInt(accountId),
      vendorId
    );

    res.status(200).json({
      success: true,
      data: account,
      message: 'Primary bank account set successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete bank account
 */
export const deleteBankAccount = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const { accountId } = req.params;

    const result = await vendorBankAccountService.deleteBankAccount(
      parseInt(accountId),
      vendorId
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Bank account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify bank account (admin)
 */
export const verifyBankAccount = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const account = await vendorBankAccountService.verifyBankAccount(
      parseInt(accountId)
    );

    res.status(200).json({
      success: true,
      data: account,
      message: 'Bank account verified successfully',
    });
  } catch (error) {
    next(error);
  }
};
