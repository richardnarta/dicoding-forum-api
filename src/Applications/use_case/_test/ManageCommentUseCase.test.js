const ManageCommentUseCase = require('../ManageCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('ManageCommentUseCase', () => {
  describe('addComment Function', () => {
    it('should throw error if use case payload not valid', async () => {
      // Arrange
      const credential = {
        id: '1',
        username: 'dicoding'
      }

      const thread_id = 'thread-123';

      const useCasePayload = {};
      const manageCommentUseCase = new ManageCommentUseCase({});

      // Action & Assert
      await expect(manageCommentUseCase.addComment(credential, thread_id, useCasePayload))
        .rejects
        .toThrowError('MANAGE_COMMENT_USE_CASE.NO_CONTENT');
    });

    it('should throw error if use case payload data type not valid', async () => {
      // Arrange
      const credential = {
        id: '1',
        username: 'dicoding'
      }

      const thread_id = 'thread-123';

      const useCasePayload = {
        content: true
      };
      const manageCommentUseCase = new ManageCommentUseCase({});

      // Action & Assert
      await expect(manageCommentUseCase.addComment(credential, thread_id, useCasePayload))
        .rejects
        .toThrowError('MANAGE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should orchestrating the proccess of adding comment correctly', async () => {
      // Arrange
      const credential = {
        id: '1',
        username: 'dicoding'
      }

      const thread_id = 'thread-123';

      const useCasePayload = {
        content: 'content-comment',
      };

      const mockedNewComment = {
        id: 'comment-123',
        timestamp: '',
        content: useCasePayload.content,
        thread_id: thread_id,
        owner_username: credential.username,
        is_deleted: false
      }

      const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.isThreadAvailable = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const mockCommentRepository = new CommentRepository();
      mockCommentRepository.addComment = jest.fn()
        .mockImplementation(() => Promise.resolve(mockedNewComment));
      
      const manageCommentUseCase = new ManageCommentUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
      });

      // Action
      const addedComment = await manageCommentUseCase.addComment(
        credential, thread_id, useCasePayload
      );

      // Assert
      expect(addedComment).toStrictEqual({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: credential.id
      });
      expect(mockThreadRepository.isThreadAvailable).toBeCalledWith(thread_id);
      expect(mockCommentRepository.addComment).toBeCalledWith({
        content: mockedNewComment.content,
        threadId: thread_id,
        ownerUsername: credential.username,
      });
    });
  });

  describe('deleteComment Function', () => {
    it('should throw error if comment not belong to the user', async () => {
      // Arrange
      const credential = {
        id: '1',
        username: 'dicoding'
      }

      const commentId = 'comment-123';

      const threadId = 'thread-123';

      const mockedComment = {
        id: commentId,
        content: 'comment-content',
        thread_id: 'thread-123',
        owner_username: 'john',
        is_deleted: false
      }

      const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.isThreadAvailable = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const mockCommentRepository = new CommentRepository();
      mockCommentRepository.getCommentById = jest.fn()
        .mockImplementationOnce(() => Promise.resolve(mockedComment));
      
      const manageCommentUseCase = new ManageCommentUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository
      });

      // Action & Assert
      await expect(manageCommentUseCase.deleteComment(credential, threadId, commentId))
        .rejects
        .toThrowError('MANAGE_COMMENT_USE_CASE.NOT_THE_OWNER_OF_COMMENT');
      expect(mockThreadRepository.isThreadAvailable).toBeCalledWith(threadId);
      expect(mockCommentRepository.getCommentById).toBeCalledWith(commentId);
    });

    it('should throw error if comment has been deleted', async () => {
      // Arrange
      const credential = {
        id: '1',
        username: 'dicoding'
      }

      const commentId = 'comment-123';

      const threadId = 'thread-123';

      const mockedComment = {
        id: commentId,
        content: 'comment-content',
        thread_id: 'thread-123',
        owner_username: 'dicoding',
        is_deleted: true
      }

      const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.isThreadAvailable = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const mockCommentRepository = new CommentRepository();
      mockCommentRepository.getCommentById = jest.fn()
        .mockImplementationOnce(() => Promise.resolve(mockedComment));
      
      const manageCommentUseCase = new ManageCommentUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository
      });

      // Action & Assert
      await expect(manageCommentUseCase.deleteComment(credential, threadId, commentId))
        .rejects
        .toThrowError('MANAGE_COMMENT_USE_CASE.COMMENT_HAS_BEEN_DELETED');
      expect(mockThreadRepository.isThreadAvailable).toBeCalledWith(threadId);
      expect(mockCommentRepository.getCommentById).toBeCalledWith(commentId);
    });

    it('should orchestrating the proccess of deleting comment correctly', async () => {
      // Arrange
      const credential = {
        id: '1',
        username: 'dicoding'
      }

      const commentId = 'comment-123';
      const threadId = 'thread-123';

      const mockedComment = {
        id: commentId,
        content: 'comment-content',
        thread_id: 'thread-123',
        owner_username: 'dicoding',
        is_deleted: false
      }

      const mockedDeletedComment = {
        id: commentId,
        content: 'comment-content',
        thread_id: 'thread-123',
        owner_username: 'dicoding',
        is_deleted: true
      }

      const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.isThreadAvailable = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const mockCommentRepository = new CommentRepository();
      mockCommentRepository.getCommentById = jest.fn()
        .mockImplementation(() => Promise.resolve(mockedComment));

      mockCommentRepository.deleteCommentById = jest.fn()
        .mockImplementation(() => Promise.resolve(mockedDeletedComment));
      
      const manageCommentUseCase = new ManageCommentUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
      });

      // Action
      const deletedComment = await manageCommentUseCase.deleteComment(
        credential, threadId, commentId
      );

      // Assert
      expect(deletedComment).toStrictEqual(true);
      expect(mockThreadRepository.isThreadAvailable).toBeCalledWith(threadId);
      expect(mockCommentRepository.getCommentById).toBeCalledWith(commentId);
      expect(mockCommentRepository.deleteCommentById).toBeCalledWith(commentId);
    });
  });
});