/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('votes_problems', {
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
    vote_type: {
      type: 'varchar(255)',
      notNull: true,
    },
  });
  pgm.createTable('votes_comments', {
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
    comment_id: {
      type: 'integer',
      notNull: true,
      references: 'comments(id)',
      onDelete: 'cascade',
    },
    vote_type: {
      type: 'varchar(255)',
      notNull: true,
    },
  });
  pgm.createIndex('votes_problems', ['user_id', 'problem_id', 'vote_type'], {
    unique: true,
  });
  pgm.createIndex('votes_comments', ['user_id', 'comment_id', 'vote_type'], {
    unique: true,
  });
};

exports.down = (pgm) => {
  pgm.dropTable('votes_comments');
  pgm.dropTable('votes_problems');
};
