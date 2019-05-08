module.exports = server => {
    const boom = require('boom');
    const joi = require('joi');
    const jwt = require('jsonwebtoken');
    const { User, Ticket } = require('./../models');

    const createToken = (user, expiresIn = '1d') => {
        return jwt.sign(user.toJSON({ omitPivot: true }), process.env.SECRET, {algorithm: 'HS256', expiresIn});
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

    const userFromRequest = request => request.auth.credentials;

    // Schemas
    const id = joi.number().integer().min(0).required();
    const password = joi.string().alphanum().min(7).max(30).required();
    const username = joi.string().alphanum().min(3).max(30).required();

    // Sign in
    server.route({
        method: 'POST',
        path: '/auth',
        handler: async (request, h) => {
            try {
                const {payload: {username, password}} = request;
                const {token, user} = await authenticate(request, username, password, h);
                if (token) {
                    return h.response({token, user}).header('authorization', token);
                }
                return boom.unauthorized();
            } catch (e) {
                console.error(e);
                return new boom(e);
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

                return h.response(user.toJSON({ omitPivot: true })).code(201);
            } catch (e) {
                console.error(e);
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
            try {
                const {auth: {credentials: {username}}} = request;
                const user = await User.forge().where('username', username).fetch();

                if (!user) {
                    throw boom.badData();
                }

                return h.response(user.toJSON({omitPivot: true})).header("Authorization", request.headers.authorization);
            } catch (e) {
                console.error(e);
                return boom.internal();
            }
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
                return h.response(tickets.toJSON({ omitPivot: true }));
            } catch (e) {
                console.error(e);
                return boom.internal();
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/my-tickets',
        options: {
            auth: 'jwt'
        },
        handler: async (request, h) => {
            try {
                const { username } = userFromRequest(request);
                if (!username) return boom.badData();
                const user = await User.forge({ username }).fetch({
                    withRelated: [
                      'tickets',
                    ],
                });
                const tickets = user.related('tickets');
                return h.response(tickets.toJSON({ omitPivot: true }));
            } catch (e) {
                console.error(e);
                throw boom.internal();
            }
        }
    });

    const handleAddOrRemoveTicket = async (request, h) => {
        try {
            const { username } = userFromRequest(request);
            const {payload: { ticket_id: ticketId }} = request;
            if (!username || !ticketId) return boom.badData();

            const ticket = await Ticket.forge({ id: ticketId }).fetch();
            if (!ticket) return boom.badData();

            const user = await User.forge({ username }).fetch({
                withRelated: [
                    'tickets',
                ],
            });

            if (!user) return boom.badData();

            const tickets = user.related('tickets');

            const add = request.url.pathname === '/add-ticket';

            if (add && tickets.models.find(t => t.id === ticketId)) return boom.badData();

            add ? await tickets.attach(ticket.get('id')) : await tickets.detach(ticket.get('id'));

            return add ? h.response().code(201) : h.response().code(204);
        } catch (e) {
            console.error(e);
            throw boom.internal();
        }
    };

    server.route({
        method: 'POST',
        path: '/add-ticket',
        options: {
            auth: 'jwt',
            validate: {
                payload: joi.object().keys({
                    ticket_id: id,
                }),
            },
        },
        handler: handleAddOrRemoveTicket,
    });
    server.route({
        method: 'POST',
        path: '/remove-ticket',
        options: {
            auth: 'jwt',
            validate: {
                payload: joi.object().keys({
                    ticket_id: id,
                }),
            },
        },
        handler: handleAddOrRemoveTicket,
    });
};
