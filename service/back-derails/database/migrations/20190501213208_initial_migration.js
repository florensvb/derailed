
exports.up = function(knex) {
  return knex.schema
      .createTableIfNotExists('users', table => {
         table.increments();

         table.string('username');
         table.string('password_digest');

         table.unique(['username']);

         table.timestamps();
      });
};

exports.down = function(knex) {
    return knex.schema
        .table('users', table => {
            table.dropUnique(['username']);
        })
        .dropTableIfExists('users');
};
