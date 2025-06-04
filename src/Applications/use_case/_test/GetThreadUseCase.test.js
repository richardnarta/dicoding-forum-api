const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetThreadUseCase', () => {
  it('should orchestrating the proccess of getting threads correctly', async () => {
    // Arrange
    const thread_id = 'thread-123';

    const mockedThread = {
      id: thread_id,
      timestamp: '2021-08-08T07:59:16.198Z',
      title: 'thread-title',
      body: 'thread-body',
      owner_username: 'dicoding',
    }

    const mockedComment = {
      id: 'comment-123',
      timestamp: '2021-08-08T07:59:16.198Z',
      content: 'comment-content',
      thread_id: mockedThread.id,
      owner_username: 'dicoding',
      is_deleted: false,
    }

    const mockedDeletedComment = {
      id: 'comment-456',
      timestamp: '2021-08-08T07:59:16.198Z',
      content: 'comment-deleted-content',
      thread_id: mockedThread.id,
      owner_username: 'dicoding',
      is_deleted: true,
    }

    const mockedReply = {
      id: 'reply-123',
      timestamp: '2021-08-08T07:59:16.198Z',
      content: 'reply-content',
      comment_id: mockedComment.id,
      owner_username: 'dicoding',
      is_deleted: false,
    }

    const mockedDeletedReply = {
      id: 'reply-456',
      timestamp: '2021-08-08T07:59:16.198Z',
      content: 'reply-content',
      comment_id: mockedComment.id,
      owner_username: 'dicoding',
      is_deleted: true,
    }

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedThread));

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementationOnce(() => Promise.resolve([
        mockedComment, mockedDeletedComment
      ]));
      mockCommentRepository.getCommentsLikes = jest.fn()
      .mockImplementationOnce(() => Promise.resolve([
        {
          comment_id: 'comment-123',
          counts: '3'
        }
      ]));

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(
        [mockedReply, mockedDeletedReply]))

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository
    });

    // Action
    const threads = await getThreadUseCase.execute(thread_id);

    // Assert
    expect(threads).toStrictEqual({
      id: thread_id,
      title: 'thread-title',
      body: 'thread-body',
      date: '2021-08-08T07:59:16.198Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: mockedComment.timestamp,
          replies: [
            {
              id: mockedReply.id,
              content: mockedReply.content,
              date: mockedReply.timestamp,
              username: 'dicoding',
            },
            {
              id: mockedDeletedReply.id,
              content: "**balasan telah dihapus**",
              date: mockedDeletedReply.timestamp,
              username: 'dicoding',
            }
          ],
          content: mockedComment.content,
          likeCount: 3
        },
        {
          id: mockedDeletedComment.id,
          username: 'dicoding',
          date: mockedDeletedComment.timestamp,
          replies: [],
          content: "**komentar telah dihapus**",
          likeCount: 0
        }
      ]
    });
    expect(mockThreadRepository.getThreadById).toBeCalledWith(thread_id);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(thread_id);
    expect(mockCommentRepository.getCommentsLikes).toBeCalledWith(['comment-123', 'comment-456']);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(
      ['comment-123', 'comment-456']
    );
  });
});