/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  /**
   * deliberately choosing not to add an index here in favour of keeping the write operations fast
   * as this table will be write-heavy. for read a given digest_id, the generated set of problems
   * will never change. hence, it should be cached.
   */
  pgm.createTable('digests_problems', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    digest_id: {
      type: 'integer',
      notNull: true,
      references: 'digests(id)',
      onDelete: 'cascade',
    },
    configuration_id: {
      type: 'integer',
      notNull: true,
      references: 'user_configurations(id)',
      onDelete: 'cascade',
    },
    problem_id: {
      type: 'integer',
      references: 'problems(id)',
      notNull: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('digests_problems');
};
