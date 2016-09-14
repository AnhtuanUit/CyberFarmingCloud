module.exports = {
    'Env': {
        'development': {
            'Database': 'mongodb://127.0.0.1/SmartFarm',
            'Image': '',
            'Redis': {
                'Host': '127.0.0.1',
                'Port': 6379
            },
        },
        'production': {
            'Database': 'mongodb://127.0.0.1/SmartFarm',
            'Image': '',
            'Redis': {
                'Host': '127.0.0.1',
                'Port': 6379
            }
        }
    },
    'JWTSecret': 'SmartFarmSecret',
    'Populate': {
        'User': 'username avatar isOnline gender',
        'UserFull': '-salt -hashed_password',
    },
    'User': {
        'Role': {
            'Admin': 1,
            'User': 2
        }
    }
};
