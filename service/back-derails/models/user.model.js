module.exports = bookshelf.Model.extend({
    tableName: 'users',
    hasSecurePassword: true,
    hasTimestamps: true,
    hidden: [
        'password_digest',
        'created_at',
    ],
    tickets: function() {
        return this.hasMany(require('./ticket.model'), 'user_id');
    }
});