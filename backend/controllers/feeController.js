const { query } = require('../database/db');
const { sendNotification } = require('../services/notificationService');

const createFeeRecord = async (req, res) => {
  try {
    const { studentId, feeType, amount, dueDate, notes } = req.body;

    if (!studentId || !feeType || !amount || !dueDate) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await query(
      'INSERT INTO fee_records (student_id, fee_type, amount, due_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [studentId, feeType, amount, dueDate, notes]
    );

    const student = await query(
      'SELECT s.full_name, s.parent_id FROM students s WHERE s.id = $1',
      [studentId]
    );

    if (student.rows.length > 0) {
      await sendNotification(
        student.rows[0].parent_id,
        'Fee Payment Due',
        `${feeType} of $${amount} is due on ${dueDate}`,
        'fee',
        result.rows[0].id
      );
    }

    res.status(201).json({
      message: 'Fee record created successfully',
      feeRecord: result.rows[0]
    });
  } catch (error) {
    console.error('Create fee record error:', error);
    res.status(500).json({ error: 'Failed to create fee record' });
  }
};

const getFeeRecords = async (req, res) => {
  try {
    const { studentId, paymentStatus } = req.query;

    let queryText = `
      SELECT f.*, s.full_name as student_name, s.student_id
      FROM fee_records f
      JOIN students s ON f.student_id = s.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (studentId) {
      queryText += ` AND f.student_id = $${paramCount}`;
      params.push(studentId);
      paramCount++;
    }

    if (paymentStatus) {
      queryText += ` AND f.payment_status = $${paramCount}`;
      params.push(paymentStatus);
      paramCount++;
    }

    queryText += ' ORDER BY f.due_date DESC';

    const result = await query(queryText, params);

    res.json({
      feeRecords: result.rows
    });
  } catch (error) {
    console.error('Get fee records error:', error);
    res.status(500).json({ error: 'Failed to fetch fee records' });
  }
};

const recordPayment = async (req, res) => {
  try {
    const { feeId, amountPaid, paymentMethod, notes } = req.body;

    if (!feeId || !amountPaid) {
      return res.status(400).json({ error: 'Fee ID and amount are required' });
    }

    const feeRecord = await query('SELECT * FROM fee_records WHERE id = $1', [feeId]);
    
    if (feeRecord.rows.length === 0) {
      return res.status(404).json({ error: 'Fee record not found' });
    }

    const fee = feeRecord.rows[0];
    const totalPaid = parseFloat(fee.amount_paid || 0) + parseFloat(amountPaid);
    const totalAmount = parseFloat(fee.amount);

    let paymentStatus = 'pending';
    if (totalPaid >= totalAmount) {
      paymentStatus = 'paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'partial';
    }

    const result = await query(
      'UPDATE fee_records SET amount_paid = $1, payment_status = $2, payment_date = CURRENT_TIMESTAMP, payment_method = $3, notes = $4 WHERE id = $5 RETURNING *',
      [totalPaid, paymentStatus, paymentMethod, notes, feeId]
    );

    res.json({
      message: 'Payment recorded successfully',
      feeRecord: result.rows[0]
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

module.exports = {
  createFeeRecord,
  getFeeRecords,
  recordPayment
};
