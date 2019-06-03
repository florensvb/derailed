exports.up = async function(knex) {
    await knex.schema
        .createTable('indexers', table => {
            table.increments();
            table.string('index').notNullable();
            table.integer('user_id').unsigned().notNullable();
            table.foreign('user_id').references('users.id');
            table.timestamps();
        });
};

exports.down = async function(knex) {
    await knex.schema
      .table('indexers', table => {
        table.dropForeign('user_id');
      });
    return knex.schema.dropTable('indexers')
};