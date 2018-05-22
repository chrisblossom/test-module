/**
 * This file is managed by backtrack
 *
 * source: @backtrack/preset-preset
 * namespace: wallaby
 *
 * DO NOT MODIFY
 */

'use strict';

const Backtrack = require('@backtrack/core');

const { configManager } = new Backtrack();

const wallaby = (wallabyConfig) => {
    /**
     * Needed for monorepo
     */
    process.env.NODE_PATH = require('path').join(
        wallabyConfig.localProjectDir,
        '../../node_modules'
    );

    return configManager({
        namespace: 'wallaby',
        config: {
            files: [
                { pattern: 'lib/**/__sandbox__/**/*', instrument: false },
                { pattern: 'lib/**/__sandbox__/**/.*', instrument: false },
                { pattern: 'lib/files/*', instrument: false },
                { pattern: 'lib/files/.*', instrument: false },
                { pattern: '.*', instrument: false },
                { pattern: '*', instrument: false },
                { pattern: '.circleci/*', instrument: false },
                'lib/**/*.js',
                'jest.config.js',
                '.env',
                'lib/**/*.snap',
                '!lib/**/*.test.js',
            ],

            tests: ['lib/**/*.test.js'],

            hints: {
                ignoreCoverage: /ignore coverage/,
            },

            env: {
                type: 'node',
                runner: 'node',
            },

            testFramework: 'jest',

            setup: (setupConfig) => {
                /**
                 * link node_modules inside wallaby's temp dir
                 *
                 * https://github.com/wallabyjs/public/issues/1663#issuecomment-389717074
                 */
                const fs = require('fs');
                const path = require('path');
                const modulesLink = path.join(
                    wallaby.projectCacheDir,
                    'node_modules'
                );
                if (fs.existsSync(modulesLink) === false)
                    fs.symlinkSync(
                        path.join(wallaby.localProjectDir, 'node_modules'),
                        modulesLink,
                        'dir'
                    );
                /**
                 * Set to project local path so backtrack can correctly resolve modules
                 * https://github.com/wallabyjs/public/issues/1552#issuecomment-372002860
                 */
                process.chdir(setupConfig.localProjectDir);

                process.env.NODE_ENV = 'test';
                const jestConfig = require('./jest.config');
                setupConfig.testFramework.configure(jestConfig);

                /**
                 * https://github.com/wallabyjs/public/issues/1268#issuecomment-323237993
                 *
                 * reset to expected wallaby process.cwd
                 */
                process.chdir(setupConfig.projectCacheDir);
            },
        },
    });
};

module.exports = wallaby;
