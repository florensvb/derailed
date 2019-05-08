
exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('user_tickets', table => {
      table.increments();

      table.integer('user_id').unsigned().notNullable();
      table.integer('ticket_id').unsigned().notNullable();

      table.foreign('user_id').references('users.id');
      table.foreign('ticket_id').references('tickets.id');

      table.unique(['user_id', 'ticket_id']);

      table.timestamps();
    })
};

exports.down = function(knex, Promise) {
  return knex.schema
    .table('user_tickets', table => {
      table.dropForeign('user_id');
      table.dropForeign('ticket_id');
      table.dropUnique(['user_id', 'ticket_id']);
    })
    .dropTable('user_tickets');
};
