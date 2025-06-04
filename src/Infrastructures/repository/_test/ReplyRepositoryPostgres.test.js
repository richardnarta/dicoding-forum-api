const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('reply should persist in database after adding', async () => {
      // Arrange
      const replyData = {
        content: 'reply-content',
        commentId: 'comment-123',
        ownerUsername: 'dicoding',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(replyData);

      // Assert
      const reply = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(reply).toHaveLength(1);
    });

    it('should return newly added reply correctly', async () => {
      // Arrange
      const replyData = {
        content: 'reply-content',
        commentId: 'comment-123',
        ownerUsername: 'dicoding',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const newComment = await replyRepositoryPostgres.addReply(replyData);

      const expectedReturn = {
        id: 'reply-123',
        content: 'reply-content',
        comment_id: 'comment-123',
        owner_username: 'dicoding',
      };

      // Assert
      expect(newComment).toMatchObject(expectedReturn);
      expect(newComment).toHaveProperty('timestamp');
      expect(newComment).toHaveProperty('is_deleted');
      expect(newComment.is_deleted).toEqual(false);
    });
  });

  describe('getReplyById function', () => {
    it('should return Not Found Error when no matching reply', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      return expect(replyRepositoryPostgres.getReplyById('reply-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return expected reply', async () => {
      // Arrange
      const replyData = {
        content: 'reply-content',
        commentId: 'comment-123',
        ownerUsername: 'dicoding',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      await replyRepositoryPostgres.addReply(replyData);

      // Action
      const reply = await replyRepositoryPostgres.getReplyById('reply-123');

      const expectedReturn = {
        id: 'reply-123',
        content: 'reply-content',
        comment_id: 'comment-123',
        owner_username: 'dicoding',
        is_deleted: false
      };

      // Assert
      expect(reply).toStrictEqual(expectedReturn);
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return empty list when no replies associated with comment', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(['comment-123']);

      // Assert
      expect(replies).toHaveLength(0);
    });

    it('should return replies related to corresponding comment', async () => {
      // Arrange
      const replyData = {
        content: 'reply-content',
        commentId: 'comment-123',
        ownerUsername: 'dicoding',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      await replyRepositoryPostgres.addReply(replyData);

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(['comment-123']);

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].comment_id).toStrictEqual('comment-123');
      expect(replies[0].id).toStrictEqual('reply-123');
      expect(replies[0].content).toStrictEqual(replyData.content);
      expect(replies[0].owner_username).toStrictEqual(replyData.ownerUsername);
    });
  });

  describe('deleteReplyById function', () => {
    it('should change the status of deleted reply', async () => {
      // Arrange
      const replyData = {
        content: 'reply-content-1',
        commentId: 'comment-123',
        ownerUsername: 'dicoding',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      await replyRepositoryPostgres.addReply(replyData);

      // Action
      const deletedReply = await replyRepositoryPostgres.deleteReplyById('reply-123');

      // Assert
      const expectedReturn = {
        id: 'reply-123',
        content: 'reply-content-1',
        comment_id: 'comment-123',
        owner_username: 'dicoding',
        is_deleted: true
      };

      // Assert
      expect(deletedReply).toMatchObject(expectedReturn);
      expect(deletedReply.is_deleted).toEqual(true);
    });
  });
});