const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

class Media extends Model {}

Media.init({
    type: {
        type: DataTypes.STRING, // e.g., 'image', 'video'
        allowNull: false
    },
    url: {
        type: DataTypes.STRING, // URL to the media
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Media'
});

Media.belongsTo(User);
User.hasMany(Media, { onDelete: 'CASCADE' });

module.exports = Media;
