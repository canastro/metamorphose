const chai = require('chai');
const expect = chai.expect;
const SchemaObject = require('../lib/schema-object');

describe('SchemaObject', function() {

    describe('create', () => {
        context('when has a transform function defined', () => {
            it('should transform a key', () => {
                const original = { brand: 'brand' };
                const expected = { brand: 'BRAND' };
                const Base = new SchemaObject({
                    brand: {
                        type: String,
                        key: 'brand',
                        transform: (brand) => brand.toUpperCase()
                    }
                });

                const result = Base.create(original);

                expect(result.toObject()).to.deep.equal(expected);
            });
        });

        context('when defaults to a value', () => {
            it('should default the schema value if the key is not defined', () => {
                const original = { brand: 'brand' };
                const expected = { brand: 'BRAND', other: 'default' };
                const Base = new SchemaObject({
                    brand: {
                        type: String,
                        key: 'brand',
                        transform: (brand) => brand.toUpperCase()
                    },
                    other: { key: 'other', defaults: 'default' }
                });

                const result = Base.create(original);

                expect(result.toObject()).to.deep.equal(expected);
            });
        });

        context('when has nested schemas', () => {
            it('should transform nested properties', () => {
                const original = { size: 42 };
                const expected = { price: 'N/A', specs: { size: '42"' } };
                const Spec = new SchemaObject({
                    size: {
                        key: 'size',
                        transform: (size) => `${size}"`
                    }
                });

                const Tv = new SchemaObject({
                    specs: { key: ':root', type: Spec },
                    price: { key: 'price', defaults: 'N/A' }
                });

                const result = Tv.create(original);

                expect(result.toObject()).to.deep.equal(expected);
            });
        });

        context('when a schema property is just a string', () => {
            const original = { brand: 'brand', ignored: true };
            const expected = { brand: 'brand' };
            const Base = new SchemaObject({
                brand: 'brand'
            });

            const result = Base.create(original);

            expect(result.toObject()).to.deep.equal(expected);
        });
    });

    describe('extends', () => {
        it('should inherit base class schema', () => {
            const original = { brand: 'brand' };
            const expected = { brand: 'BRAND', price: 'N/A' };
            const Base = new SchemaObject({
                brand: {
                    type: String,
                    key: 'brand',
                    transform: (brand) => brand.toUpperCase()
                }
            });

            const Tv = Base.extends({
                price: { key: 'price', defaults: 'N/A' }
            });

            const result = Tv.create(original);

            expect(result.toObject()).to.deep.equal(expected);
        });
    });
});
