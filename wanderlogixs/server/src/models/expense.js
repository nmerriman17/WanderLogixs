const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

class Expense extends Model {}

Expense.init({
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Expense'
});

Expense.belongsTo(User);
User.hasMany(Expense, { onDelete: 'CASCADE' });

module.exports = Expense;
