/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('user_configurations', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade',
    },
    tags: {
      type: 'varchar[]',
      notNull: true,
    },
    schedule: {
      type: 'varchar',
      notNull: true,
    },
    last_ran_at: {
      type: 'timestamp with time zone',
    },
    count_easy: {
      type: 'integer',
      notNull: true,
    },
    count_medium: {
      type: 'integer',
      notNull: true,
    },
    count_hard: {
      type: 'integer',
      notNull: true,
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
    },
  });
  pgm.createIndex('user_configurations', ['user_id']);
};

exports.down = (pgm) => {
  pgm.dropTable('user_configurations');
};
