/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('tags', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
  });

  pgm.createTable('problems', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    source: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: true,
    },
    difficulty: {
      type: 'varchar(255)',
      notNull: true,
    },
    title: {
      type: 'varchar(255)',
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

  pgm.createTable('problems_tags', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    problem_id: {
      type: 'integer',
      notNull: true,
      references: 'problems(id)',
      onDelete: 'cascade',
    },
    tag_id: {
      type: 'integer',
      notNull: true,
      references: 'tags(id)',
      onDelete: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('problems_tags');
  pgm.dropTable('problems');
  pgm.dropTable('tags');
};
