module.exports = bookshelf.Model.extend({
    tableName: 'users',
    hasSecurePassword: true,
    hasTimestamps: true,
    hidden: [
        'password_digest',
        'user_role',
        'avatar',
        'phone_number',
        'created_at',
        'updated_at',
    ],
    tickets: function() {
        return this.hasMany(require('./ticket.model'), 'user_id');
    }
});