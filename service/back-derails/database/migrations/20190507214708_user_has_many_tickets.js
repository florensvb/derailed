
exports.up = function(knex) {
  return knex.schema
    .createTable('tickets', table => {
      table.increments();

      table.integer('user_id').unsigned().notNullable();
      table.integer('train_id').unsigned().notNullable();

      table.foreign('user_id').references('users.id');
      table.foreign('train_id').references('trains.id');

      table.string('ticket_id');

      table.unique(['user_id', 'train_id']);

      table.timestamps();
    })
};

exports.down = function(knex) {
  return knex.schema
    .table('tickets', table => {
      table.dropForeign('user_id');
      table.dropForeign('train_id');
      table.dropUnique(['user_id', 'train_id']);
    })
    .dropTable('tickets');
};
