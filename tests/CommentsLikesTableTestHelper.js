/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsLikesTableTestHelper = {
  async addCommentLike({
    comment_id = '111',
    username = '111',
  }) {
    const query = {
      text: 'INSERT INTO comments_likes (comment_id, username) VALUES ($1, $2)',
      values: [comment_id, username],
    };

    await pool.query(query);
  },

  async countLikes(id) {
    const query = {
      text: 'SELECT comment_id, count(comment_id) AS counts FROM comments_likes WHERE comment_id = ANY($1) GROUP BY comment_id',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async checkCommentLike({
    comment_id = '111',
    username = '111',
  }) {
    const query = {
      text: 'SELECT * FROM comments_likes WHERE comment_id=$1 AND username=$2',
      values: [comment_id, username],
    };

    const result = await pool.query(query);

    if (result.rowCount == 0) {
      return false
    } else {
      return true
    }
  },

  async deleteCommentLike({
    comment_id = '111',
    username = '111',
  }) {
    const query = {
      text: 'DELETE FROM comments_likes WHERE comment_id=$1 AND username=$2',
      values: [comment_id, username],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE comments_likes RESTART IDENTITY CASCADE');
  },
};

module.exports = CommentsLikesTableTestHelper;
