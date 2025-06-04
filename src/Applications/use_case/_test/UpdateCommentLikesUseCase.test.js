const UpdateCommentLikesUseCase = require('../UpdateCommentLikesUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentsLikesTableTestHelper = require('../../../../tests/CommentsLikesTableTestHelper');

describe('UpdateCommentsLikesUseCase', () => {
  it('should throw error if comment has been deleted', async () => {
    // Arrange
    const credential = {
      id: '1',
      username: 'dicoding'
    }

    const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.isThreadAvailable = jest.fn()
        .mockImplementation(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
      mockCommentRepository.getCommentById = jest.fn()
        .mockImplementationOnce(() => Promise.resolve(
          {
            id: 'comment-123',
            content: 'comment-content',
            thread_id: 'thread-123',
            owner_username: 'dicoding',
            is_deleted: true,
          }
        ));

    const updateCommentLikesUseCase = new UpdateCommentLikesUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository
    });

    // Action & Assert

    await expect(updateCommentLikesUseCase.execute(credential, 'thread-123', 'comment-123'))
      .rejects.toThrowError('UPDATE_COMMENT_LIKE_USE_CASE.COMMENT_HAS_BEEN_DELETED');
    expect(mockThreadRepository.isThreadAvailable).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentById).toBeCalledWith('comment-123');
  });

  it('should orchestrating the proccess of create like correctly', async () => {
    // Arrange
    const credential = {
      id: '1',
      username: 'dicoding'
    }

    const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.isThreadAvailable = jest.fn()
        .mockImplementation(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
      mockCommentRepository.getCommentById = jest.fn()
        .mockImplementationOnce(() => Promise.resolve(
          {
            id: 'comment-123',
            content: 'comment-content',
            thread_id: 'thread-123',
            owner_username: 'dicoding',
            is_deleted: false,
          }
        ));
      mockCommentRepository.isCommentLikedByUser = jest.fn()
        .mockImplementationOnce(() => Promise.resolve(false));
      mockCommentRepository.addCommentLike = jest.fn()
        .mockImplementationOnce(() => Promise.resolve());

    const updateCommentLikesUseCase = new UpdateCommentLikesUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository
    });

    // Action & Assert
    
    await expect(updateCommentLikesUseCase.execute(credential, 'thread-123', 'comment-123'))
        .resolves.not.toThrowError();
    expect(mockThreadRepository.isThreadAvailable).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentById).toBeCalledWith('comment-123');
    expect(mockCommentRepository.isCommentLikedByUser).toBeCalledWith({
      commentId: 'comment-123',
      username: 'dicoding'
    });
    expect(mockCommentRepository.addCommentLike).toBeCalledWith({
      commentId: 'comment-123',
      username: 'dicoding'
    });
  });

  it('should orchestrating the proccess of undo create like correctly', async () => {
    // Arrange
    const credential = {
      id: '1',
      username: 'dicoding'
    }

    await CommentsLikesTableTestHelper.addCommentLike(
      {
        comment_id: 'comment-123',
        username: 'dicoding'
      }
    );

    const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.isThreadAvailable = jest.fn()
        .mockImplementation(() => Promise.resolve());

    const mockCommentRepository = new CommentRepository();
      mockCommentRepository.getCommentById = jest.fn()
        .mockImplementationOnce(() => Promise.resolve(
          {
            id: 'comment-123',
            content: 'comment-content',
            thread_id: 'thread-123',
            owner_username: 'dicoding',
            is_deleted: false,
          }
        ));
      mockCommentRepository.isCommentLikedByUser = jest.fn()
        .mockImplementationOnce(() => Promise.resolve(true));
      mockCommentRepository.deleteCommentLike = jest.fn()
        .mockImplementationOnce(() => Promise.resolve());

    const updateCommentLikesUseCase = new UpdateCommentLikesUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository
    });

    // Action & Assert
    
    await expect(updateCommentLikesUseCase.execute(credential, 'thread-123', 'comment-123'))
        .resolves.not.toThrowError();
    expect(mockThreadRepository.isThreadAvailable).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentById).toBeCalledWith('comment-123');
    expect(mockCommentRepository.isCommentLikedByUser).toBeCalledWith({
      commentId: 'comment-123',
      username: 'dicoding'
    });
    expect(mockCommentRepository.deleteCommentLike).toBeCalledWith({
      commentId: 'comment-123',
      username: 'dicoding'
    });
  });
})