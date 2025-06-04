const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(commentData) {
    const { content, threadId, ownerUsername } = commentData;
    const timestamp = new Date();
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING *',
      values: [id, timestamp, content, threadId, ownerUsername],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async getCommentById(commentId) {
    const query = {
      text: 'SELECT id, content, thread_id, owner_username, is_deleted FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount == 0) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    return result.rows[0];
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: 'SELECT * FROM comments WHERE thread_id = $1 ORDER BY timestamp ASC',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = true WHERE id = $1 RETURNING id, content, thread_id, owner_username, is_deleted',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async isCommentAvailable(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount == 0) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async addCommentLike(likeData) {
    const { commentId, username } = likeData;
    const query = {
      text: 'INSERT INTO comments_likes (comment_id, username) VALUES($1, $2)',
      values: [commentId, username],
    };

    await this._pool.query(query);
  }

  async getCommentsLikes(commentIds) {
    const query = {
      text: 'SELECT comment_id, count(comment_id) AS counts FROM comments_likes WHERE comment_id = ANY($1) GROUP BY comment_id',
      values: [commentIds],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async isCommentLikedByUser(likeData) {
    const { commentId, username } = likeData;
    const query = {
      text: 'SELECT * FROM comments_likes WHERE comment_id=$1 AND username=$2',
      values: [commentId, username],
    };

    const status = await this._pool.query(query);

    if (status.rowCount == 0) {
      return false;
    } else {
      return true;
    }
  }

  async deleteCommentLike(likeData) {
    const { commentId, username } = likeData;
    const query = {
      text: 'DELETE FROM comments_likes WHERE comment_id=$1 AND username=$2',
      values: [commentId, username],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;