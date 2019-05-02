'use strict';

require('dotenv').config();
const { development } = require('./knexfile');
const bookshelf = require('bookshelf')(require('knex')(development));
const boom = require('boom');
const Hapi = require('hapi');
const joi = require('joi');
const jwt = require('jsonwebtoken');

const securePassword = require('bookshelf-secure-password');
bookshelf.plugin(securePassword);
bookshelf.plugin('visibility');
global.bookshelf = bookshelf;

const { User } = require('./models');

const start = async () => {

    const createToken = (user, expiresIn = '1d') => {
        return jwt.sign(user.toJSON(), process.env.SECRET, {algorithm: 'HS256', expiresIn});
    };

    const authenticate = async (request, username, password, h) => {
        const user = await User.forge().where('username', username).fetch();
        if (!user) {
            throw boom.notFound();
        }

        await user.authenticate(password);

        if (!user) {
            throw boom.unauthorized();
        }

        return {
            token: createToken(user),
            user: user,
        };
    };

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

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST
    });

    await server.register(require('hapi-auth-jwt2'));

    server.auth.strategy('jwt', 'jwt', {
        key: process.env.SECRET,                    // Never Share your secret key
        validate,                                   // validate function defined above
        verifyOptions: { algorithms: [ 'HS256' ] }  // pick a strong algorithm
    });
    server.auth.default('jwt');

    // Sign in
    server.route({
        method: 'POST',
        path: '/auth',
        handler: async (request, h) => {
            const { payload: { username, password } } = request;
            const { token, user } = await authenticate(request, username, password, h);
            if (token) {
                return h.response({ token, user }).header('authorization', token);
            }
            return boom.unauthorized();
        },
        options: {
            auth: false,
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
            auth: false,
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
        path:'/user',
        options: {
            auth: 'jwt'
        },
        handler: async (request, h) => {
            const { auth: { credentials: { username } } }  = request;
            const user = await User.forge().where('username', username).fetch();

            if (!user) {
                throw boom.badData();
            }

            return h.response(user.toJSON()).header("Authorization", request.headers.authorization);
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
