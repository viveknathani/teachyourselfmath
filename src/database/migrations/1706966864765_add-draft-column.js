/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn(
    'problems',
    {
      status: {
        type: 'varchar(255)',
      },
    },
    {
      ifNotExists: true,
    },
  );
};

exports.down = (pgm) => {
  pgm.dropColumns('problems', ['status']);
};
