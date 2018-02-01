// @flow

const nock = require('nock')

const geocder = require('../../lib/geocode')

const mockReverseResult = require('./__fixtures__/mock-reverse-result.json')
const mockSearchResult = require('./__fixtures__/mock-encode-result.json')
const mockSuggestResult = require('./__fixtures__/mock-suggest-result.json')

describe('geocoder-arcgis-geojson', () => {
  describe('encode', () => {
    it('should make basic encode query', (done) => {
      nock('https://geocode.arcgis.com/')
        .get(/arcgis\/rest\/services\/World\/GeocodeServer\/findAddressCandidates/)
        .reply(200, (uri, requestBody) => {
          expect(uri).toMatchSnapshot('basic encode request uri')
          return mockSearchResult
        })

      geocder.encode('123 main st', (err, result) => {
        expect(err).toBeFalsy()
        expect(result).toMatchSnapshot('basic encode g-a-g response')
        done()
      })
    })
  })



  describe('reverse', () => {
    it('should make basic reverse query', (done) => {
      nock('https://geocode.arcgis.com/')
        .get(/arcgis\/rest\/services\/World\/GeocodeServer\/reverseGeocode/)
        .reply(200, (uri, requestBody) => {
          expect(uri).toMatchSnapshot('basic reverse request uri')
          return mockReverseResult
        })

      geocder.reverse(
        {
          lat: 37.061460,
          lon: -122.006443
        },
        (err, result) => {
          expect(err).toBeFalsy()
          expect(result).toMatchSnapshot('basic reverse g-a-g response')
          done()
        }
      )
    })
  })

  describe('suggest', () => {
    it('should make basic suggest query', (done) => {
      nock('https://geocode.arcgis.com/')
        .get(/arcgis\/rest\/services\/World\/GeocodeServer\/suggest/)
        .reply(200, (uri, requestBody) => {
          expect(uri).toMatchSnapshot('basic suggest request uri')
          return mockSuggestResult
        })

      geocder.suggest('123 main st', (err, result) => {
        expect(err).toBeFalsy()
        expect(result).toMatchSnapshot('basic suggest g-a-g response')
        done()
      })
    })
  })
})
