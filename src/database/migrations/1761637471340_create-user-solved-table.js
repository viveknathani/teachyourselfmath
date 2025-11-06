/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('user_solved', {
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
    problem_id: {
      type: 'integer',
      notNull: true,
      references: 'problems(id)',
      onDelete: 'cascade',
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
    },
  });
  pgm.createIndex('user_solved', ['user_id', 'problem_id'], {
    unique: true,
  });
};

exports.down = (pgm) => {
  pgm.dropTable('user_solved');
};
