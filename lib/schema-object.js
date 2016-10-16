'use strict';

/**
 * @name getKey
 * @param {Object} schemaItem
 * @return {string}
 * It returns the schema key
 * If the schemaItem is a string, then itself is the key
 * Otherwise it must have a key property
 */
function getKey(schemaItem) {
    if (typeof schemaItem === 'string') {
        return schemaItem;
    }

    return schemaItem.key;
}

/**
 * @name getValue
 * @param {Object} value
 * @param {String} key
 * @returns {Object|String|Number}
 * Given the key it splits it by dot notation and
 * iterates it to return the final value
 */
function getValue(value, key) {
    return key.split('.').reduce((object, index) => object[index], value);
}

class SchemaObjectInstance {
    constructor(schema, values) {
        this.valid = true;
        this.schema = schema;
        this.original = values;
        this.obj = null;
    }

    /**
     * @name getItemValue
     * @param {Object|String} schemaItem
     * @param {Object} original
     * @returns {Object|String|Number}
     * Given a schema item is obtained a they key to fetch the values from the original object
     * If schemaItem is a string, then it self is the key, otherwise it should have a key property
     * If the key is :root then return the complete original object (this might be used in a transform function)
     * Otherwise only return the given key from the original object
     *
     * TODO: validate schemaItem properties
     */
    _getItemValue(schemaItem, original) {
        const key = getKey(schemaItem);

        return key === ':root' ? original : getValue(original, key);
    }

    /**
     * @name parse
     * @param {Object} schema
     * @param {Object} original
     * @returns {Object}
     * Iterates all of the schema keys
     * For each key it validates it's value
     * If the item is valid it gets the value is valid then it adds it to the final object
     * This can be done by invoking create on a inner schema
     * By calling a transform function
     * By simply setting the exact same value
     * Or by setting the default value
     */
    _parse(schema, original) {
        const result = {};

        Object.keys(schema).forEach((key) => {
            const schemaItem = schema[key];
            const value = this._getItemValue(schemaItem, original);

            // Validate schema[key].type
            const isItemValid = this._isItemValid(schemaItem, value);

            if (!isItemValid) {
                this.valid = false;
                return result[key] = value;
            }

            if (schemaItem.type instanceof SchemaObject) {
                return result[key] = schemaItem.type.create(value).toObject();
            }

            // Call schema[key].transform
            if (schemaItem.transform) {
                return result[key] = schemaItem.transform(value);
            }

            if (schemaItem.defaults !== undefined) {
                return result[key] = schemaItem.defaults;
            }

            return result[key] = value;
        });

        return result;
    }

    /**
     * @name isItemValid
     * @param {Object|String} schemaItem
     * @param {Object|String|Number} value
     * It validates if the current valid is against the given schema
     * If the schema is a string, it just returns true because it means there is no type defined
     * If no type is defined it returns true
     * If the type is a SchemaObject it returns true
     * If the schema type is a function, then it compares the typeof to the name of the function
     */
    _isItemValid(schemaItem, value) {
        if (typeof schemaItem === 'string') {
            return true;
        }

        if (schemaItem.type instanceof SchemaObject) {
            return true;
        }

        if (typeof schemaItem.type === 'function') {
            return typeof value === schemaItem.type.name.toLowerCase();
        }

        return true;
    }

    toObject() {
        if (!this.obj) {
            this.obj = this._parse(this.schema, this.original);
        }

        return this.obj;
    }
}

class SchemaObject {
    constructor (schema) {
        this.schema = schema;
    }

    /**
     * @name extends
     * @param {Object} schema
     * @returns {SchemaObject}
     * It gives the developer the ability to instanciate a new schema
     * extending a base schema
     */
    extends (schema) {
        return new SchemaObject(Object.assign({}, this.schema, schema));
    }

    /**
     * @name create
     * @param {Object} value
     * @returns {SchemaObjectInstance}
     * It creates a new instance based on the given schema with the
     * provided values
     */
    create (value) {
        return new SchemaObjectInstance(this.schema, value);
    }
}

module.exports = SchemaObject;
