const ManageReplyUseCase = require('../ManageReplyUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('ManageReplyUseCase', () => {
  describe('addReply Function', () => {
    it('should throw error if use case payload not valid', async () => {
      // Arrange
      const credential = {
        id: '1',
        username: 'dicoding'
      }

      const thread_id = 'thread-123';
      const comment_id = 'comment-123';

      const useCasePayload = {};
      const manageReplyUseCase = new ManageReplyUseCase({});

      // Action & Assert
      await expect(manageReplyUseCase.addReply(
        credential, thread_id, comment_id, useCasePayload
      )).rejects
        .toThrowError('MANAGE_REPLY_USE_CASE.NO_CONTENT');
    });

    it('should throw error if use case payload data type not valid', async () => {
      // Arrange
      const credential = {
        id: '1',
        username: 'dicoding'
      }

      const thread_id = 'thread-123';
      const comment_id = 'comment-123';

      const useCasePayload = {
        content: 1
      };
      const manageReplyUseCase = new ManageReplyUseCase({});

      // Action & Assert
      await expect(manageReplyUseCase.addReply(
        credential, thread_id, comment_id, useCasePayload
      )).rejects
        .toThrowError('MANAGE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should orchestrating the proccess of adding reply correctly', async () => {
      // Arrange
      const credential = {
        id: '1',
        username: 'dicoding'
      }

      const thread_id = 'thread-123';
      const comment_id = 'comment-123';

      const useCasePayload = {
        content: 'content-reply',
      };

      const mockedNewReply = {
        id: 'reply-123',
        timestamp: '',
        content: useCasePayload.content,
        comment_id: comment_id,
        owner_username: credential.username,
        is_deleted: false
      }

      const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.isThreadAvailable = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const mockCommentRepository = new CommentRepository();
      mockCommentRepository.isCommentAvailable = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const mockReplyRepository = new ReplyRepository();
      mockReplyRepository.addReply = jest.fn()
        .mockImplementation(() => Promise.resolve(mockedNewReply));
      
      const manageReplyUseCase = new ManageReplyUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository
      });

      // Action
      const addedReply = await manageReplyUseCase.addReply(
        credential, thread_id, comment_id, useCasePayload
      );

      // Assert
      expect(addedReply).toStrictEqual({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: credential.id
      });
      expect(mockThreadRepository.isThreadAvailable).toBeCalledWith(thread_id);
      expect(mockCommentRepository.isCommentAvailable).toBeCalledWith(comment_id);
      expect(mockReplyRepository.addReply).toBeCalledWith({
        content: mockedNewReply.content,
        commentId: comment_id,
        ownerUsername: credential.username,
      });
    });
  });

  describe('deleteReply Function', () => {
    it('should throw error if reply not belong to the user', async () => {
      // Arrange
      const credential = {
        id: '1',
        username: 'dicoding'
      }

      const replyId = 'reply-123';

      const commentId = 'comment-123';

      const threadId = 'thread-123';

      const mockedReply = {
        id: replyId,
        content: 'reply-content',
        comment_id: commentId,
        owner_username: 'john',
        is_deleted: false
      }

      const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.isThreadAvailable = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const mockCommentRepository = new CommentRepository();
      mockCommentRepository.isCommentAvailable = jest.fn()
        .mockImplementationOnce(() => Promise.resolve());

      const mockReplyRepository = new ReplyRepository();
      mockReplyRepository.getReplyById = jest.fn()
        .mockImplementationOnce(() => Promise.resolve(mockedReply));
      
      const manageReplyUseCase = new ManageReplyUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
      });

      // Action & Assert
      await expect(manageReplyUseCase.deleteReply(credential, threadId, commentId, replyId))
        .rejects
        .toThrowError('MANAGE_REPLY_USE_CASE.NOT_THE_OWNER_OF_REPLY');
      expect(mockThreadRepository.isThreadAvailable).toBeCalledWith(threadId);
      expect(mockCommentRepository.isCommentAvailable).toBeCalledWith(commentId);
      expect(mockReplyRepository.getReplyById).toBeCalledWith(replyId);
    });

    it('should throw error if reply has been deleted', async () => {
      // Arrange
      const credential = {
        id: '1',
        username: 'dicoding'
      }

      const replyId = 'reply-123';

      const commentId = 'comment-123';

      const threadId = 'thread-123';

      const mockedReply = {
        id: replyId,
        content: 'reply-content',
        comment_id: commentId,
        owner_username: 'dicoding',
        is_deleted: true
      }

      const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.isThreadAvailable = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const mockCommentRepository = new CommentRepository();
      mockCommentRepository.isCommentAvailable = jest.fn()
        .mockImplementationOnce(() => Promise.resolve());

      const mockReplyRepository = new ReplyRepository();
      mockReplyRepository.getReplyById = jest.fn()
        .mockImplementationOnce(() => Promise.resolve(mockedReply));
      
      const manageReplyUseCase = new ManageReplyUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
      });

      // Action & Assert
      await expect(manageReplyUseCase.deleteReply(credential, threadId, commentId, replyId))
        .rejects
        .toThrowError('MANAGE_REPLY_USE_CASE.REPLY_HAS_BEEN_DELETED');
      expect(mockThreadRepository.isThreadAvailable).toBeCalledWith(threadId);
      expect(mockCommentRepository.isCommentAvailable).toBeCalledWith(commentId);
      expect(mockReplyRepository.getReplyById).toBeCalledWith(replyId);
    });

    it('should orchestrating the proccess of deleting reply correctly', async () => {
      // Arrange
      const credential = {
        id: '1',
        username: 'dicoding'
      }

      const replyId = 'reply-123';

      const commentId = 'comment-123';

      const threadId = 'thread-123';

      const mockedReply = {
        id: replyId,
        content: 'reply-content',
        comment_id: commentId,
        owner_username: 'dicoding',
        is_deleted: false
      }

      const mockedDeletedReply = {
        id: replyId,
        content: 'reply-content',
        comment_id: commentId,
        owner_username: 'dicoding',
        is_deleted: true
      }

      const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.isThreadAvailable = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const mockCommentRepository = new CommentRepository();
      mockCommentRepository.isCommentAvailable = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const mockReplyRepository = new ReplyRepository();
      mockReplyRepository.getReplyById = jest.fn()
        .mockImplementation(() => Promise.resolve(mockedReply));

      mockReplyRepository.deleteReplyById = jest.fn()
        .mockImplementation(() => Promise.resolve(mockedDeletedReply));
      
      const manageReplyUseCase = new ManageReplyUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
      });

      // Action

      const deletedReply = await manageReplyUseCase.deleteReply(
        credential, threadId, commentId, replyId
      );

      // Assert
      expect(deletedReply).toStrictEqual(true);
      expect(mockThreadRepository.isThreadAvailable).toBeCalledWith(threadId);
      expect(mockCommentRepository.isCommentAvailable).toBeCalledWith(commentId);
      expect(mockReplyRepository.getReplyById).toBeCalledWith(replyId);
      expect(mockReplyRepository.deleteReplyById).toBeCalledWith(replyId);
    });
  });
});