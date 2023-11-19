const express = require('express');
const router = express.Router();
const Expense = require('../models/expense'); 
const authenticateToken = require('server/middleware/authenticateToken.js'); // If you have authentication middleware
const { Op, Sequelize } = require('sequelize');

// Add a new expense
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { userId, amount, category, date } = req.body;
        const newExpense = await Expense.create({ userId, amount, category, date });
        res.status(201).json(newExpense);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Get all expenses for a user
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const expenses = await Expense.findAll({ where: { userId } });
        res.json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Get expenses categorized
router.get('/categorized/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const expenses = await Expense.findAll({
            where: { userId },
            attributes: [
                'category', 
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']
            ],
            group: ['category'],
            order: [['category', 'ASC']]
        });

        res.json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Update an expense
router.put('/:expenseId', authenticateToken, async (req, res) => {
    try {
        const expenseId = req.params.expenseId;
        const updatedData = req.body;

        const expense = await Expense.findByPk(expenseId);
        if (!expense) {
            return res.status(404).send('Expense not found');
        }

        await expense.update(updatedData);
        res.send('Expense updated');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Delete an expense
router.delete('/:expenseId', authenticateToken, async (req, res) => {
    try {
        const expenseId = req.params.expenseId;
        const expense = await Expense.findByPk(expenseId);

        if (!expense) {
            return res.status(404).send('Expense not found');
        }

        await expense.destroy();
        res.send('Expense deleted');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
