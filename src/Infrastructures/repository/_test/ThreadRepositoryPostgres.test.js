const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('thread should persist in database after adding', async () => {
      // Arrange
      const threadData = {
        title: 'thread-title',
        body: 'thread-body',
        ownerUsername: 'dicoding',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(threadData);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return newly added thread correctly', async () => {
      // Arrange
      const threadData = {
        title: 'thread-title',
        body: 'thread-body',
        ownerUsername: 'dicoding',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const newThread = await threadRepositoryPostgres.addThread(threadData);

      const expectedReturn = {
        id: 'thread-123',
        title: 'thread-title',
        body: 'thread-body',
        owner_username: 'dicoding',
      };

      // Assert
      expect(newThread).toMatchObject(expectedReturn);
      expect(newThread).toHaveProperty('timestamp');
    });
  });

  describe('getThreadById function', () => {
    it('should return not found Error when no matching thread', async () => {
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      return expect(threadRepositoryPostgres.getThreadById('thread-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return expected thread', async () => {
      // Arrange
      const threadData = {
        title: 'thread-title',
        body: 'thread-body',
        ownerUsername: 'dicoding',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await threadRepositoryPostgres.addThread(threadData);

      // Action

      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      const expectedReturn = {
        id: 'thread-123',
        title: 'thread-title',
        body: 'thread-body',
        owner_username: 'dicoding',
      };

      // Assert
      expect(thread).toMatchObject(expectedReturn);
      expect(thread).toHaveProperty('timestamp');
    });
  });

  describe('isThreadAvailable function', () => {
    it('should return NotFoundError when no matching thread', async () => {
      // Arrange
      const pool = {
        query: jest.fn().mockResolvedValue({ rowCount: 0 }),
      };
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(threadRepositoryPostgres.isThreadAvailable('thread-123'))
        .rejects
        .toThrowError('thread tidak ditemukan');
    });

    it('should return nothing when thread exists', async () => {
      // Arrange
      const pool = {
        query: jest.fn().mockResolvedValue({ rowCount: 1, rows: [{ id: 'thread-123' }] }),
      };
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

       // Action & Assert
      await expect(threadRepositoryPostgres.isThreadAvailable('thread-123'))
        .resolves.not.toThrowError(NotFoundError);
      });
  });
});