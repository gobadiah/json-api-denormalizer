# json-api-denormalizer

[![Build Status](https://travis-ci.org/gobadiah/json-api-denormalizer.svg?branch=master)](https://travis-ci.org/gobadiah/json-api-denormalizer)

Denormalize a state build by https://github.com/redux-json-api/redux-json-api.

## Install

```
yarn add json-api-denormalizer
npm install --save json-api-denormalizer
```

## Usage

With a state looking like this:

```
{
    "providers": {
        "data": [
            {
                "attributes": {
                    "provider": "facebook",
                    "uid": "1015511500"
                },
                "id": "1",
                "links": {
                    "self": "http://127.0.0.1:8000/providers/1"
                },
                "type": "providers"
            },
            {
                "attributes": {
                    "provider": "google",
                    "uid": "10805182745064"
                },
                "id": "2",
                "links": {
                    "self": "http://127.0.0.1:8000/providers/2"
                },
                "type": "providers"
            }
        ]
    },
    "stats": {
        "data": [
            {
                "attributes": {
                    "data": {
                        "ranking": 36457
                    },
                    "date": "2018-01-30"
                },
                "id": "2",
                "relationships": {
                    "user": {
                        "data": {
                            "id": "1",
                            "type": "users"
                        },
                        "links": {
                            "related": "http://127.0.0.1:8000/users/1"
                        }
                    }
                },
                "type": "stats"
            }
        ]
    },
    "users": {
        "data": [
            {
                "attributes": {
                    "birthday": "1970-01-01",
                    "place-of-birth": "Paris",
                    "email": "some@example.com",
                    "first-name": "Michaël",
                    "gender": "male",
                    "last-name": "Corleone"
                },
                "id": "1",
                "links": {
                    "self": "http://127.0.0.1:8000/users/1"
                },
                "relationships": {
                    "current-stats": {
                        "data": {
                            "id": "2",
                            "type": "stats"
                        },
                        "links": {
                            "related": "http://127.0.0.1:8000/users/1/current_stats"
                        }
                    },
                    "providers": {
                        "data": [
                            {
                                "id": "2",
                                "type": "providers"
                            },
                            {
                                "id": "1",
                                "type": "providers"
                            }
                        ],
                        "links": {
                            "related": "http://127.0.0.1:8000/users/1/providers",
                            "self": "http://127.0.0.1:8000/users/1/relationships/providers"
                        },
                        "meta": {
                            "count": 2
                        }
                    }
                },
                "type": "users"
            }
        ]
    }
}
```

You get something like this:

```
{
  users: {
    1: {
      birthday: "1970-01-01",
      place_of_birth: "Paris",
      email: "some@example.com",
      first_name: "Michaël",
      gender: "male",
      last_name: "Corleone",
      current_stats: [Current stats],
      providers: [
        [Provider 2],
        [Provider 1],
      ]
    }
  },
  stats: {
    2: {
      data: {
        ranking: 36457,
      },
      date: "2018-01-30",
      user: [User 1]
    }
  },
  providers: {
    1: {
      provider: "facebook",
      uid: "1015511500",
    },
    2: {
      provider: "google",
      uid: "10805182745064"
    }
  }
}
```

Relationships are made by reference, not copied, so `[User 1]` have a `current_stats` key which points to `[Stats 2]` which in turn have a `user` key which point to `[User 1]`. That way we don't end up in a infinite loop when denormalizing, we use less space and if for whatever reason you change an object, all relationships are updated as well.

This can become a problem if you need serializing, for example when using [nextjs](https://github.com/zeit/next.js/) and denormalized data in initial props, it will be serialized and send to server.
If this is a problem, you can use this :

```
import denormalizer, { removeCircularReferences } from 'json-api-denormalizer';

// state.api is redux-json-api default state location
const me = denormalizer(state.api).users[1];

// If you can't control serialization, for example inside getInitialProps of nextjs
me.toJSON = () => removeCircularReferences(me);

// If you can control serialization :
fetch('/some/api/requiring/plain/json', removeCircularReferences(me));
```

## Tests

```
npm run test
```
