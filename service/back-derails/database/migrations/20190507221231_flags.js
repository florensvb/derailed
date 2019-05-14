exports.up = async function(knex) {
    await knex.schema
        .createTable('notflags', table => {
            table.increments();
            table.string('flag').notNullable();
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        });

    await knex('notflags').insert([
        {flag: "ENO6QMAAAeETi6mGPeJgd83rWfM2U3bcg8KZLsICovytDw=", updated_at: new Date()},
        {flag: "ENO91SSQZea2Sd0aSZOMHFGetqwu2nSW98sSjwhgfsqm31=", updated_at: new Date()},
        {flag: "ENO01SAimq8Zy32hAPQmzu3hjkasd89kJN32nunaaaDas1=", updated_at: new Date()}
        ]
    );
};

exports.down = function(knex) {
    return knex.schema
        .dropTable('notflags')
};