
exports.up = async function(knex) {
    await knex.schema
        .createTable('tickets', table => {
            table.increments();

            table.string('train');
            table.string('train_type');
            table.dateTime('departure');

            table.timestamps();
        });

    await knex('tickets').insert(
        [...Array(1000).keys()]
            .map(number => {
                return {
                    train: `train-${number}`,
                    train_type: 'lokomotive',
                    departure: new Date(),
                    created_at: new Date()
                }
            })
    );
};

exports.down = function(knex) {
    return knex.schema
        .dropTable('tickets');
};
