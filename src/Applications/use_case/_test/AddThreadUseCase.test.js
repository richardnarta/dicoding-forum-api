const AddThreadUseCase = require('../AddThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddThreadUseCase', () => {
  it('should throw error if use case payload not valid', async () => {
    // Arrange
    const useCasePayload = {};
    const addThreadUseCase = new AddThreadUseCase({});

    // Action & Assert
    await expect(addThreadUseCase.execute({}, useCasePayload))
      .rejects
      .toThrowError('THREAD_USE_CASE.PAYLOAD_INVALID');
  });

  it('should throw error if use case payload data type not valid', async () => {
    // Arrange
    const useCasePayload = {
      title: 'thread-title',
      body: true
    };
    const addThreadUseCase = new AddThreadUseCase({});

    // Action & Assert
    await expect(addThreadUseCase.execute({}, useCasePayload))
      .rejects
      .toThrowError('ADD_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the proccess of adding thread correctly', async () => {
    // Arrange
    const credential = {
      id: '1',
      username: 'dicoding'
    }

    const useCasePayload = {
      title: 'title-thread',
      body: 'title-body'
    };

    const mockedNewThread = {
      id: 'thread-123',
      timestamp: '',
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner_username: credential.username,
    }

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockedNewThread));
    
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository
    });

    // Action
    const addedThread = await addThreadUseCase.execute(credential, useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: credential.id
    });
    expect(mockThreadRepository.addThread).toBeCalledWith({
      title: useCasePayload.title,
      body: useCasePayload.body,
      ownerUsername: credential.username
    });
  });
});