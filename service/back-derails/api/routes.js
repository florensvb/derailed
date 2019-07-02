module.exports = server => {
    const boom = require('boom');
    const fs = require('fs');
    const joi = require('joi');
    const md5 = require('md5');
    const { User, Ticket, Train} = require('./../models');

    const userFromRequest = request => {
        if (!request.auth.credentials || !request.auth.credentials.username) throw boom.unauthorized();
        return request.auth.credentials;
    };

    // Schemas
    const id = joi.number().integer().min(0).required();
    const unrequiredString = joi.string();
    const password = joi.string().alphanum().min(7).max(30).required();
    const username = joi.string().required();

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
        path: '/trains',
        options: {
            auth: 'jwt'
        },
        handler: async (request, h) => {
            try {
                const trains = await Train.forge().fetchAll();
                return h.response(trains.toJSON({ omitPivot: true }));
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
                const user = await User.forge({ username }).fetch({
                    withRelated: [
                      'tickets.train',
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
            const { payload: { train_id: trainId, ticket_id: ticketId }} = request;
            if (!username || !trainId) return boom.badData('Cant find username or train_id');

            const train = await Train.forge({ id: trainId }).fetch();
            if (!train) return boom.badData('Cant find the train that youre looking for');

            const user = await User.forge({ username }).fetch({
                withRelated: [
                    'tickets',
                ],
            });

            if (!user) return boom.badData('No user');

            const add = request.url.pathname === '/add-ticket';

            if (add) {
                const ticket = await Ticket.forge({
                    train_id: train.get('id'),
                    user_id: user.get('id'),
                });
                if (ticketId) {
                    ticket.set('ticket_id', ticketId);
                }
                await ticket.save();
            } else {
                const ticket = await Ticket.forge({
                    train_id: train.get('id'),
                    user_id: user.get('id'),
                }).fetch();

                if (!ticket) return boom.badData('Cant find your ticket bra');

                await ticket.destroy();
            }

            return add ? h.response().code(201) : h.response().code(204);
        } catch (e) {
            console.error(e);
            throw boom.internal();
        }
    };

    const createToken = (user) => {
        const secret = process.env.SECRET;
        return jwt.sign({ id: user.get('id'), username: user.get('username') }, `${{ secret }}`, { algorithm: 'HS256' });
    };

    const authenticate = async (request, username, password, h) => {
        const user = await User.forge().where('username', username).fetch();
        if (!user) {
            throw boom.notFound();
        }

        try {
            await user.authenticate(password);
        } catch (e) {
            throw boom.unauthorized();
        }

        if (!user) {
            throw boom.unauthorized();
        }

        return {
            token: createToken(user),
            user: user,
        };
    };

    const jwt = require('jsonwebtoken');
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

    server.route({
        method: 'POST',
        path: '/add-ticket',
        options: {
            auth: 'jwt',
            validate: {
                payload: joi.object().keys({
                    train_id: id,
                    ticket_id: unrequiredString,
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
                    train_id: id,
                }),
            },
        },
        handler: handleAddOrRemoveTicket,
    });

    server.route({
        method: 'GET',
        path: '/user-profile',
        options: {
            auth: 'jwt',
        },
        handler: async (request, h) => {
            try {
                const { username } = userFromRequest(request);
                const user = await User.forge().where('username', username).fetch();
                if (!user) return boom.notFound();
                return h.response(user.toJSON())
            } catch (e) {
                console.error(e);
                return boom.internal();
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/user-avatar/{id}',
        options: {
            auth: 'jwt',
        },
        handler: async (request, h) => {
            try {
                const { username } = userFromRequest(request);
                const user = await User.forge({ username }).fetch();
                const fileName = user.get('avatar');
                return h.file(`${__dirname}/../uploads/${fileName}`, { confine: false });
            } catch (e) {
                console.error(e);
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/user-avatar',
        options: {
            auth: 'jwt',
            payload: {
                allow: 'multipart/form-data',
                maxBytes: 3456789,
                output: 'stream',
                parse: true,
            },
        },
        handler: async (request, h) => {
            try {
                const data = request.payload;
                const avatar = data['avatar']; // accept a field call avatar

                if (!avatar) {
                    return boom.badData('No avatar in the form data');
                }

                const { username } = userFromRequest(request);
                const user = await User.forge({ username }).fetch();
                if (!user) return boom.badData();

                const fileName = avatar.hapi.filename;
                const mimeType = fileName.split('.').pop();

                const digest = md5(avatar._data);
                const folder = `${__dirname}/../uploads`;
                const path = `${folder}/${digest}.${mimeType}`;
                const newFileName = `${digest}.${mimeType}`;

                if (!fs.existsSync(folder)) {
                    fs.mkdirSync(folder);
                }

                fs.writeFileSync(path, avatar._data);
                await user.set('avatar', newFileName).save();
                return h.response(user.toJSON());
            } catch (err) {
                // error handling
                return boom.badRequest(err.message, err);
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/uploads/{file*}',
        options: {
            auth: 'jwt'
        },
        handler: {
            directory: {
                path: 'uploads/',
                redirectToSlash: true,
                listing: true,
            },
        },
    })
};
