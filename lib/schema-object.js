'use strict';

class SchemaObjectInstance {
    constructor(schema, values) {
        this.valid = true;
        this.schema = schema;
        this.original = values;
        this.obj = {};

        this.parse();
    }

    /**
     * @name getItemValue
     * @param {Object|String} schemaItem
     * @returns {Object|String|Number}
     * Given a schema item is obtained a they key to fetch the values from the original object
     * If schemaItem is a string, then it self is the key, otherwise it should have a key property
     * If the key is :root then return the complete original object (this might be used in a transform function)
     * Otherwise only return the given key from the original object
     *
     * TODO: validate schemaItem properties
     */
    getItemValue(schemaItem) {
        let key;
        if (typeof schemaItem === 'string') {
            key = schemaItem;
        } else {
            key = schemaItem.key;
        }

        return key === ':root' ? this.original : this.original[key];
    }

    /**
     * @name parse
     * @returns {Object}
     */
    parse() {
        Object.keys(this.schema).forEach((key) => {
            const schemaItem = this.schema[key];
            const value = this.getItemValue(schemaItem);

            // Validate this.schema[key].type
            const isItemValid = this.isItemValid(schemaItem, value);

            if (!isItemValid) {
                this.valid = false;
                return this.obj[key] = value;
            }

            if (schemaItem.type instanceof SchemaObject) {
                return this.obj[key] = schemaItem.type.create(value).obj;
            }

            // Call this.schema[key].transform
            if (schemaItem.transform) {
                return this.obj[key] = schemaItem.transform(value);
            }

            if (value) {
                return this.obj[key] = value;
            }

            if (schemaItem.defaults !== undefined) {
                return this.obj[key] = schemaItem.defaults;
            }
        });
    }

    isItemValid(schemaItem, value) {
        if (typeof schemaItem === 'string') {
            return true;
        }

        if (!schemaItem.type) {
            return true;
        }

        if (schemaItem.type instanceof SchemaObject) {
            return true;
        }

        if (typeof schemaItem.type === 'function') {
            return typeof value === schemaItem.type.name.toLowerCase();
        }
    }
}

class SchemaObject {
    constructor (schema) {
        this.schema = schema;
    }

    extends (schema) {
        return new SchemaObject(Object.assign({}, this.schema, schema));
    }

    create (values) {
        return new SchemaObjectInstance(this.schema, values);
    }
}

module.exports = SchemaObject;
