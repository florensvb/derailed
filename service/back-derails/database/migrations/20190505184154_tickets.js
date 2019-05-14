const schedule = require('./../trains');

exports.up = async function(knex) {
    await knex.schema
        .createTable('trains', table => {
            table.increments();

            table.string('name');
            table.string('track');
            table.string('from');
            table.string('to');
            table.dateTime('departure');
            table.dateTime('arrival');

            table.timestamps();
        });

    await knex('trains').insert(
        schedule.emojis
            .map(train => {
                return {
                    name: train.train_display,
                    track: train.track,
                    from: train.station_from.name,
                    to: train.station_to.name,
                    departure: train.leaves,
                    arrival: train.arrives,
                    created_at: new Date(),
                }
            })
    );
};

exports.down = function(knex) {
    return knex.schema
        .dropTable('trains');
};
