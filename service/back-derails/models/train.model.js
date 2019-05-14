module.exports = bookshelf.Model.extend({
    tableName: 'trains',
    hasTimestamps: true,
    hidden: [
        'created_at',
        'updated_at',
    ],
    user: function() {
        return this.belongsTo(require('./user.model'));
    }
});