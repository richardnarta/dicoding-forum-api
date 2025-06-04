exports.up = (pgm) => {
  pgm.createTable('comments_likes', {
    id: {
      type: 'SERIAL',
      primaryKey: true,
    },
    comment_id: {
      type: 'TEXT',
      notNull: true,
    },
    username: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('comments_likes');
};
