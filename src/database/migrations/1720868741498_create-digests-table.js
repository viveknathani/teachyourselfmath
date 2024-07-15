/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('digests', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    configuration_id: {
      type: 'integer',
      notNull: true,
      references: 'user_configurations(id)',
      onDelete: 'cascade',
    },
    status: {
      type: 'varchar',
      notNull: true,
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  pgm.createIndex('digests', ['configuration_id']);
};

exports.down = (pgm) => {
  pgm.dropTable('digests');
};
