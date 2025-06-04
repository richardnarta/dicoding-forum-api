/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'isi-komen', 
    comment_id = '1', 
    owner_username = '111',
    is_deleted = false,
  }) {
    const time = new Date();
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, time, content, comment_id, owner_username, is_deleted],
    };

    await pool.query(query);
  },

  async findRepliesById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findRepliesByCommentId(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE comment_id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async deleteRepliesById(id) {
    const query = {
      text: 'DELETE FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE replies RESTART IDENTITY CASCADE');
  },
};

module.exports = RepliesTableTestHelper;
