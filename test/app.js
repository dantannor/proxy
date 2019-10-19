/* eslint-disable prefer-arrow-callback */
const config = require('config');

const request = require('supertest');
const chai = require('chai');

const { expect } = chai;
chai.use(require('chai-shallow-deep-equal'));
const app = require('../app');

const limit = config.get('requestLimit');

const checkMetrics = () => {
    request(app)
        .get('/metrics')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        // eslint-disable-next-line no-loop-func
        .then((response) => {
            expect(response.body).to.have.all.keys('ipstack', 'ipGeo');
        });
};
describe('GET /getIPCountry', function () {
    let count = 0;
    const ip = '2.57.231.255';
    it('should receive expected response according to request limit', function (done) {
        for (let i = 0; i < 20; i++) {
            request(app)
                .get('/getIPCountry')
                .set('Accept', 'application/json')
                .set('x-forwarded-for', ip)
                .expect('Content-Type', /json/)
                // eslint-disable-next-line no-loop-func
                .then((response) => {
                    let vendor;

                    if (i > limit - 1) {
                        vendor = 'ipGeo';
                    } else {
                        vendor = 'ipstack';
                    }

                    expect(
                        response.body,
                        `request number: ${i}`,
                    ).to.shallowDeepEqual({
                        ip,
                        countryName: 'Israel',
                        vendor,
                    });

                    count++;

                    if (count === 19) {
                        checkMetrics();
                        done();
                    }
                });
        }
    });
});