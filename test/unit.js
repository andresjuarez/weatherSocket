/* eslint-disable */
process.env.NODE_ENV = 'test'

let chai = require('chai')
let chaiHttp = require('chai-http')
let assert = require('assert')
// let server = require('../_index')
// let expect = chai.expect

chai.use(chaiHttp)

describe('/dummy', () => {
  it('should return first charachter of the string', (done) => {
    assert.equal("Hello".length, 5);
    done()
  });

})
