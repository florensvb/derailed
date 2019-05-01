'use strict';

require('dotenv').config();
const { development } = require('./knexfile');
const bookshelf = require('bookshelf')(require('knex')(development));
const boom = require('boom');
const Hapi = require('hapi');
const joi = require('joi');

const securePassword = require('bookshelf-secure-password');
bookshelf.plugin(securePassword);
global.bookshelf = bookshelf;

const { User } = require('./models');

const start = async () => {

    const validate = async (request, username, password, h) => {
        const user = await new User().where('username', username).fetch();
        if (!user) {
            throw boom.notFound();
        }

        await user.authenticate(password);

        return {
            isValid: true,
            credentials: {},
        };
    };

    console.log(process.env.HOST);
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST
    });

    await server.register(require('hapi-auth-basic'));

    server.auth.strategy('simple', 'basic', { validate });

    // Sign in
    server.route({
        method: 'POST',
        path: '/auth',
        handler: async (request, h) => {
            const { payload: { username, password } } = request;
            return validate(request, username, password);
        },
        options: {
            validate: {
                payload: joi.object().keys({
                    username: joi.string().required(),
                    password: joi.string().required(),
                }),
            },
        },
    });

    // Sign up
    server.route({
        method: 'POST',
        path: '/auth/new',
        handler: async (request, h) => {
            const { payload: { username, password } } = request;

            const existingUser = await User.forge().where('username', username).fetch();

            if (existingUser) {
                throw boom.badData();
            }

            const user = new User({ username: username, password: password });

            return user.save();
        },
        options: {
            validate: {
                payload: joi.object().keys({
                    username: joi.string().required(),
                    password: joi.string().required(),
                }),
            },
        },
    });

    server.route({
        method: 'GET',
        path:'/users',
        options: {
            auth: 'simple'
        },
        handler: (request, response) => {
            return User.forge().fetchAll();
        }
    });

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

start()
    .then(() => {})
    .catch((e) => console.error(e));
