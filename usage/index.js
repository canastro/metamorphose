'use strict';

const assert = require('assert');
const SchemaObject = require('../lib/schema-object');

const Base = new SchemaObject({
    region: {
        type: String,
        key: 'region',
        transform: (region) => region === 'both' ? 'ALL_REGIONS' : region
    },
    cardType: 'cardType'
});

const Config = new SchemaObject({
    competitionId: {
        key: 'cardDetails',
        transform: (cardDetails) => cardDetails.competitions
    },
    market: {
        key: ':root',
        transform: (card) => [{
            marketId: card.cardDetails.market,
            helper: card.title
        }]
    }
});

const Outright = Base.extends({
    config: { key: ':root', type: Config }
});

const expected = {
    region: 'ALL_REGIONS',
    cardType: 'outrightsCards',
    config: {
        competitionId: 378,
        market:[{
            marketId: 86046604,
            helper: 'To Win Any Race At Cheltenham'
        }]
    }
};

const original = {
    id: 54895,
    title: 'To Win Any Race At Cheltenham',
    displayOrder: 650,
    region: 'both',
    appPageLocation: {
        sportId: 9999005,
        linkId: 30335
    },
    link: {
        linkType: '',
        linkText: ''
    },
    upTime: 0,
    downTime: 0,
    cardType: 'outrightsCards',
    cardDetails: {
        outcomes: [ ],
        selectType: 'topX',
        class: 23,
        competitions: 378,
        events: 10169370,
        market: 86046604,
        numberOfSelections: 10,
        marketHeader: ''
    }
};

const result = Outright.create(original);
assert.deepEqual(expected, result.obj);
console.log('success');
