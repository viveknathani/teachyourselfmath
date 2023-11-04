/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    content: {
      type: 'text',
      notNull: true,
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
    parent_id: {
      type: 'integer',
      notNull: false,
      references: 'comments(id)',
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
  pgm.dropTable('comments');
};
