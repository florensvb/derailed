'use strict';

require('dotenv').config();
const { development } = require('./knexfile');
const bookshelf = require('bookshelf')(require('knex')(development));
const boom = require('boom');
const Hapi = require('hapi');
const plugRoutes = require('./api/routes');

const securePassword = require('bookshelf-secure-password');
bookshelf.plugin(securePassword);
bookshelf.plugin('visibility');
global.bookshelf = bookshelf;

const { User } = require('./models');

const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
        cors: true,
    }
});

const init = async () => {

    const validate = async (decoded, request, h) => {
        const user = await new User()
            .where('id', decoded.id)
            .where('username', decoded.username)
            .fetch();
        if (!user) {
            throw boom.notFound();
        }

        return {
            isValid: true,
        };
    };

    await server.register(require('hapi-auth-jwt2'));

    const secret = process.env.SECRET;
    server.auth.strategy('jwt', 'jwt', {
        key: `${{ secret }}`,                       // Never Share your secret key
        validate,                                   // validate function defined above
        verifyOptions: { algorithms: [ 'HS256' ] }  // pick a strong algorithm
    });
    server.auth.default('jwt');

    server.events.on('response', request => {
        if (!request) return;
        console.log(`${request.method.toUpperCase()} ${request.url.pathname} --> ${request.response.statusCode}`);
    });

    plugRoutes(server);

    return server;
};

const start = () => init()
    .then(async () => {
        await server.start(function (err) { console.log(err); });
        console.log(`Server running on ${server.info.uri}`);
    })
    .catch((e) => console.log(e));

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

module.exports =  {
    start,
    init,
};
