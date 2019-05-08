module.exports = bookshelf.Model.extend({
    tableName: 'users',
    hasSecurePassword: true,
    hasTimestamps: true,
    hidden: [
        'password_digest',
        'created_at',
        'updated_at',
    ],
    tickets: function() {
        return this.belongsToMany(require('./ticket.model'), 'user_tickets');
    }
});