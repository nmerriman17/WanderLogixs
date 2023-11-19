const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

class Trip extends Model {}

Trip.init({
    destination: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Trip'
});

Trip.belongsTo(User);
User.hasMany(Trip, { onDelete: 'CASCADE' });

module.exports = Trip;
