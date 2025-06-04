const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentsLikesTableTestHelper = require('../../../../tests/CommentsLikesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await CommentsLikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('comment should persist in database after adding', async () => {
      // Arrange
      const commentData = {
        content: 'comment-content',
        threadId: 'thread-123',
        ownerUsername: 'dicoding',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(commentData);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('should return newly added comment correctly', async () => {
      // Arrange
      const commentData = {
        content: 'comment-content',
        threadId: 'thread-123',
        ownerUsername: 'dicoding',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const newComment = await commentRepositoryPostgres.addComment(commentData);

      const expectedReturn = {
        id: 'comment-123',
        content: 'comment-content',
        thread_id: 'thread-123',
        owner_username: 'dicoding',
      };

      // Assert
      expect(newComment).toMatchObject(expectedReturn);
      expect(newComment).toHaveProperty('timestamp');
      expect(newComment).toHaveProperty('is_deleted');
      expect(newComment.is_deleted).toEqual(false);
    });
  });

  describe('getCommentById function', () => {
    it('should return Not Found Error when no matching comment', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      return expect(commentRepositoryPostgres.getCommentById('comment-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return expected comment', async () => {
      // Arrange
      const commentData = {
        content: 'comment-content',
        threadId: 'thread-123',
        ownerUsername: 'dicoding',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(commentData);

      // Action
      const comment = await commentRepositoryPostgres.getCommentById('comment-123');

      const expectedReturn = {
        id: 'comment-123',
        content: 'comment-content',
        thread_id: 'thread-123',
        owner_username: 'dicoding',
        is_deleted: false
      };

      // Assert
      expect(comment).toStrictEqual(expectedReturn);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return empty list when no comments associated with thread', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(0);
    });

    it('should return comments related to corresponding thread', async () => {
      // Arrange
      const commentData = {
        content: 'comment-content-1',
        threadId: 'thread-123',
        ownerUsername: 'dicoding',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(commentData);

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0].thread_id).toStrictEqual('thread-123');
      expect(comments[0].id).toStrictEqual('comment-123');
      expect(comments[0].content).toStrictEqual(commentData.content);
      expect(comments[0].owner_username).toStrictEqual(commentData.ownerUsername);
    });
  });

  describe('deleteCommentById function', () => {
    it('should change the status of deleted comment', async () => {
      // Arrange
      const commentData = {
        content: 'comment-content',
        threadId: 'thread-123',
        ownerUsername: 'dicoding',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await commentRepositoryPostgres.addComment(commentData);

      // Action
      const deletedComment = await commentRepositoryPostgres.deleteCommentById('comment-123');

      // Assert
      const expectedReturn = {
        id: 'comment-123',
        content: 'comment-content',
        thread_id: 'thread-123',
        owner_username: 'dicoding',
        is_deleted: true
      };

      // Assert
      expect(deletedComment).toMatchObject(expectedReturn);
      expect(deletedComment.is_deleted).toEqual(true);
    });
  });

  describe('isCommentAvailable function', () => {
    it('should return not found Error when no matching comment', async () => {
      const pool = {
        query: jest.fn().mockResolvedValue({ rowCount: 0 }), // simulates no match
      };
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      return await expect(commentRepositoryPostgres.isCommentAvailable('comment-123'))
        .rejects
        .toThrowError('komentar tidak ditemukan');
    });

    it('should not throw error when comment exists', async () => {
    // Arrange
    const pool = {
      query: jest.fn().mockResolvedValue({ rowCount: 1, rows: [{ id: 'comment-123' }] }),
    };
    const fakeIdGenerator = () => '123';
    const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

    // Action & Assert
    await expect(commentRepositoryPostgres.isCommentAvailable('comment-123'))
        .resolves.not.toThrowError(NotFoundError);
      });
  });

  describe('addCommentLike function', () => {
    it('like should persist in database after adding', async () => {
      // Arrange
      const likeData = {
        commentId: 'comment-123',
        username: 'dicoding',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addCommentLike(likeData);

      // Assert
      const like = await CommentsLikesTableTestHelper.checkCommentLike(
        {
          comment_id: 'comment-123',
          username: 'dicoding',
        }
      );
      expect(like).toEqual(true);
    });
  });

  describe('getCommentsLikes function', () => {
    it('should return expected like counts', async () => {
      // Arrange
      await CommentsLikesTableTestHelper.addCommentLike(
        {
          comment_id: 'comment-123',
          username: 'dicoding'
        }
      )

      await CommentsLikesTableTestHelper.addCommentLike(
        {
          comment_id: 'comment-123',
          username: 'john'
        }
      )

      await CommentsLikesTableTestHelper.addCommentLike(
        {
          comment_id: 'comment-234',
          username: 'dicoding'
        }
      )

      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await commentRepositoryPostgres.getCommentsLikes(['comment-123', 'comment-234']);

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(
        {
          comment_id: 'comment-123',
          counts: '2'
        }
      );
      expect(result).toContainEqual(
        {
          comment_id: 'comment-234',
          counts: '1'
        }
      );
    });
  });

  describe('isCommentLikedByUser function', () => {
    it('should return true if comment is liked by user', async () => {
      // Arrange
      await CommentsLikesTableTestHelper.addCommentLike(
        {
          comment_id: 'comment-123',
          username: 'dicoding'
        }
      )
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const status = await commentRepositoryPostgres.isCommentLikedByUser({
        commentId: 'comment-123',
        username: 'dicoding'
      });

      // Assert
      expect(status).toEqual(true);
    });

    it('should return false if comment is not liked by user', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const status = await commentRepositoryPostgres.isCommentLikedByUser({
        commentId: 'comment-123',
        username: 'dicoding'
      });

      // Assert
      expect(status).toEqual(false);
    });
  });

  describe('deleteCommentLike function', () => {
    it('like should not persist in database after deletion', async () => {
      // Arrange
      await CommentsLikesTableTestHelper.addCommentLike(
        {
          comment_id: 'comment-123',
          username: 'dicoding'
        }
      )

      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.deleteCommentLike({
        commentId: 'comment-123',
        username: 'dicoding'
      });

      // Assert
      const like = await CommentsLikesTableTestHelper.checkCommentLike(
        {
          comment_id: 'comment-123',
          username: 'dicoding',
        }
      );
      expect(like).toEqual(false);
    });
  });
});