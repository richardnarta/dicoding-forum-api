const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(replyData) {
    const { content, commentId, ownerUsername } = replyData;
    const timestamp = new Date();
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING *',
      values: [id, timestamp, content, commentId, ownerUsername],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async getReplyById(replyId) {
    const query = {
      text: 'SELECT id, content, comment_id, owner_username, is_deleted FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount == 0) {
      throw new NotFoundError('reply tidak ditemukan');
    }

    return result.rows[0];
  }

  async getRepliesByCommentId(commentIds) {
    const query = {
      text: 'SELECT * FROM replies WHERE comment_id = ANY($1) ORDER BY timestamp ASC',
      values: [commentIds],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1 RETURNING id, content, comment_id, owner_username, is_deleted',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }
}

module.exports = ReplyRepositoryPostgres;