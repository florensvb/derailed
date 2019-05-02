module.exports = bookshelf.Model.extend({
    tableName: 'users',
    hasSecurePassword: true,
    hasTimestamps: true,
    hidden: ['password_digest'],
});