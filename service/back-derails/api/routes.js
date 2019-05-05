module.exports = server => {
    const boom = require('boom');
    const joi = require('joi');
    const jwt = require('jsonwebtoken');
    const { User, Ticket } = require('./../models');

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

    // Schemas
    const username = joi.string().alphanum().min(3).max(30).required();
    const password = joi.string().alphanum().min(7).max(30).required();

    // Sign in
    server.route({
        method: 'POST',
        path: '/auth',
        handler: async (request, h) => {
            const {payload: {username, password}} = request;
            const {token, user} = await authenticate(request, username, password, h);
            if (token) {
                return h.response({token, user}).header('authorization', token);
            }
            return boom.unauthorized();
        },
        options: {
            auth: false,
            validate: {
                payload: joi.object().keys({
                    username,
                    password,
                }),
            },
        },
    });

    // Sign up
    server.route({
        method: 'POST',
        path: '/auth/new',
        handler: async (request, h) => {
            try {
                const {payload: {username, password}} = request;
                const existingUser = await User.forge().where('username', username).fetch();

                if (existingUser) {
                    return boom.badData();
                }

                const user = new User({username: username, password: password});

                await user.save();

                return h.response(user.toJSON()).code(201);
            } catch (e) {
                console.log(e);
                return boom.internal();
            }
        },
        options: {
            auth: false,
            validate: {
                payload: joi.object().keys({
                    username,
                    password,
                }),
            },
        },
    });

    server.route({
        method: 'GET',
        path: '/user',
        options: {
            auth: 'jwt'
        },
        handler: async (request, h) => {
            const {auth: {credentials: {username}}} = request;
            const user = await User.forge().where('username', username).fetch();

            if (!user) {
                throw boom.badData();
            }

            return h.response(user.toJSON()).header("Authorization", request.headers.authorization);
        }
    });

    server.route({
        method: 'GET',
        path: '/tickets',
        options: {
            auth: 'jwt'
        },
        handler: async (request, h) => {
            try {
                const tickets = await Ticket.forge().fetchAll();
                return h.response(tickets.toJSON());
            } catch (e) {
                console.error(e);
                throw boom.internal();
            }
        }
    });
};
