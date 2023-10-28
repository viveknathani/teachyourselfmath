/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    email: {
      type: 'varchar(319)',
      notNull: true,
      unique: true,
    },
    username: {
      type: 'varchar(50)',
      notNull: true,
      unique: true,
    },
    password: {
      type: 'bytea',
      notNull: true,
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
    },
    updated_at: {
      type: 'timestamp with time zone',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
