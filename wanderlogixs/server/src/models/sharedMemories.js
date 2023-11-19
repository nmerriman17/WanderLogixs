const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

class SharedMemory extends Model {}

SharedMemory.init({
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    sharedDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'SharedMemory'
});

SharedMemory.belongsTo(User);
User.hasMany(SharedMemory, { onDelete: 'CASCADE' });

module.exports = SharedMemory;
