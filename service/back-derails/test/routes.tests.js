'use strict';

const Lab = require('lab');
const { expect } = require('code');
const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const { init } = require('../server');

describe('GET /', () => {
    let server;

    beforeEach(async () => {
        server = await init();
    });

    afterEach(async () => {
        await server.stop();
    });

    it('responds with 200', async () => {
        const res = await server.inject({
            method: 'post',
            url: '/auth/new',
            payload: {
                username: 'florensaa',
                password: 'florensa',
            }
        });
        expect(res.statusCode).to.equal(201);
    });
});