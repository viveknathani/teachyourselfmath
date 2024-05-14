/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('users', {
    preferences: {
      type: 'jsonb',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('users', ['preferences']);
};
