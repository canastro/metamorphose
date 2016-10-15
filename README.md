# Metamorphose

Metamorphose is a tool that allows you to transform your objects on the fly by defining schemas.

# Features
* Extend schemas
* Default values
* Nested schemas
* Transformations
* Type validation (work in progress)

# Example
Here is a simple example that tries to include most of the features of metamorphose:

## Schema Definition
    const Base = new SchemaObject({
        brand: {
            type: String,
            key: 'brand',
            transform: (brand) => brand.toUpperCase()
        },
        isPrivate: 'isPrivate'
    });

    const Spec = new SchemaObject({
        size: {
            key: 'size',
            transform: (size) => `${size}"`
        },
        connectors: {
            key: ':root',
            transform: (tv) => (tv.videoConnectors + tv.audioConnectors).split(', ')
        }
    });

    const Tv = Base.extends({
        specs: { key: ':root', type: Spec },
        price: { key: 'price', defaults: 'N/A' }
    });

## Original Object
    const original = {
        brand: 'Grundig',
        thisShouldBeIgnored: 'HEY',
        isPrivate: true,
        size: 42,
        quality: 'Full HD',
        videoConnectors: '1 x Coaxial Digital Audio, 1 x Component Video, 1 x Composite Video, 2 x HDMI',
        audioConnectors: '1 x Headphone, 1 x PC Audio In, 1 x RCA Audio L+R'
    };

## Apply schema

    const result = Tv.create(original);

## Output

    {
        brand: 'GRUNDIG',
        isPrivate: true,
        price: 'N/A',
        specs: {
            size: '42"',
            connectors: [
                '1 x Coaxial Digital Audio',
                '1 x Component Video',
                '1 x Composite Video',
                '2 x HDMI1 x Headphone',
                '1 x PC Audio In',
                '1 x RCA Audio L+R'
            ]
        }
    }
