module.exports = bookshelf.Model.extend({
    tableName: 'users',
    hasSecurePassword: true,
});