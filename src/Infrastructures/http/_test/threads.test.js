const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 thread details', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread(
        {
          id: 'thread-123',
          title: 'thread-title',
          body: 'thread-body',
          owner_username: 'dicoding'
        }
      );

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread).toHaveProperty('id');
      expect(responseJson.data.thread).toHaveProperty('title');
      expect(responseJson.data.thread).toHaveProperty('body');
      expect(responseJson.data.thread).toHaveProperty('date');
      expect(responseJson.data.thread).toHaveProperty('username');
      expect(responseJson.data.thread).toHaveProperty('comments');
    });

    it('should response 404 if thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/1',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when POST /threads', () => {
    it('should response 201 and newly added thread details', async () => {
      // Arrange
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      const requestPayload = {
        title: 'thread-title',
        body: 'thread-body'
      }

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread).toHaveProperty('id');
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
      expect(responseJson.data.addedThread).toHaveProperty('owner');
    });

    it('should response 400 if payload was not completed', async () => {
      // Arrange
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      const requestPayload = {
        title: 'thread-title',
      }

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('harus mengirimkan payload title dan body');
    });
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and newly added comment details', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread(
        {
          id: 'thread-123',
          title: 'thread-title',
          body: 'thread-body',
          owner_username: 'dicoding'
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      const requestPayload = {
        content: 'comment-content'
      }

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment).toHaveProperty('id');
      expect(responseJson.data.addedComment.content).toEqual(requestPayload.content);
      expect(responseJson.data.addedComment).toHaveProperty('owner');
    });

    it('should response 400 if payload was not completed', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread(
        {
          id: 'thread-123',
          title: 'thread-title',
          body: 'thread-body',
          owner_username: 'dicoding'
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      const requestPayload = {
        comment: 'comment-content'
      }

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('harus mengirimkan payload content');
    });

    it('should response 404 if thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      const requestPayload = {
        content: 'comment-content'
      }

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 when success deleting comment', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread(
        {
          id: 'thread-123',
          title: 'thread-title',
          body: 'thread-body',
          owner_username: 'dicoding'
        }
      );

      await CommentsTableTestHelper.addComment(
        {
          id: 'comment-123',
          content: 'isi-komen', 
          thread_id: 'thread-123', 
          owner_username: 'dicoding',
          is_deleted: false,
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      
      const deletedComment = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(deletedComment[0].is_deleted).toEqual(true);
    });

    it('should response 403 when user is not the owner of comment', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread(
        {
          id: 'thread-123',
          title: 'thread-title',
          body: 'thread-body',
          owner_username: 'dicoding'
        }
      );

      await CommentsTableTestHelper.addComment(
        {
          id: 'comment-123',
          content: 'isi-komen', 
          thread_id: 'thread-123', 
          owner_username: 'john',
          is_deleted: false,
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak dapat menghapus comment yang bukan milik anda');
    });

    it('should response 400 when comment has been deleted before', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread(
        {
          id: 'thread-123',
          title: 'thread-title',
          body: 'thread-body',
          owner_username: 'dicoding'
        }
      );

      await CommentsTableTestHelper.addComment(
        {
          id: 'comment-123',
          content: 'isi-komen', 
          thread_id: 'thread-123', 
          owner_username: 'dicoding',
          is_deleted: true,
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar telah dihapus');
    });

    it('should response 404 when comment is not found', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread(
        {
          id: 'thread-123',
          title: 'thread-title',
          body: 'thread-body',
          owner_username: 'dicoding'
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 404 when thread is invalid', async () => {
      // Arrange
      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and newly added reply details', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread(
        {
          id: 'thread-123',
          title: 'thread-title',
          body: 'thread-body',
          owner_username: 'dicoding'
        }
      );

      await CommentsTableTestHelper.addComment(
        {
          id: 'comment-123',
          content: 'isi-komen', 
          thread_id: 'thread-123', 
          owner_username: 'dicoding',
          is_deleted: false,
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      const requestPayload = {
        content: 'reply-content'
      }

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply).toHaveProperty('id');
      expect(responseJson.data.addedReply.content).toEqual(requestPayload.content);
      expect(responseJson.data.addedReply).toHaveProperty('owner');
    });

    it('should response 400 if payload was not completed', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread(
        {
          id: 'thread-123',
          title: 'thread-title',
          body: 'thread-body',
          owner_username: 'dicoding'
        }
      );

      await CommentsTableTestHelper.addComment(
        {
          id: 'comment-123',
          content: 'isi-komen', 
          thread_id: 'thread-123', 
          owner_username: 'dicoding',
          is_deleted: false,
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      const requestPayload = {
        reply: 'comment-content'
      }

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('harus mengirimkan payload content');
    });

    it('should response 404 if thread not found', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment(
        {
          id: 'comment-123',
          content: 'isi-komen', 
          thread_id: 'thread-123', 
          owner_username: 'dicoding',
          is_deleted: false,
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      const requestPayload = {
        content: 'comment-content'
      }

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 if comment is invalid', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread(
        {
          id: 'thread-123',
          title: 'thread-title',
          body: 'thread-body',
          owner_username: 'dicoding'
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      const requestPayload = {
        content: 'comment-content'
      }

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 404 if thread is invalid', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment(
        {
          id: 'comment-123',
          content: 'isi-komen', 
          thread_id: 'thread-123', 
          owner_username: 'dicoding',
          is_deleted: false,
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      const requestPayload = {
        content: 'comment-content'
      }

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('/threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 when success deleting reply', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread(
        {
          id: 'thread-123',
          title: 'thread-title',
          body: 'thread-body',
          owner_username: 'dicoding'
        }
      );

      await CommentsTableTestHelper.addComment(
        {
          id: 'comment-123',
          content: 'isi-komen', 
          thread_id: 'thread-123', 
          owner_username: 'dicoding',
          is_deleted: false,
        }
      );

      await RepliesTableTestHelper.addReply(
        {
          id: 'reply-123',
          content: 'isi-reply', 
          comment_id: 'comment-123', 
          owner_username: 'dicoding',
          is_deleted: false,
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      
      const deletedReply = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(deletedReply[0].is_deleted).toEqual(true);
    });

    it('should response 403 when user is not the owner of reply', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread(
        {
          id: 'thread-123',
          title: 'thread-title',
          body: 'thread-body',
          owner_username: 'dicoding'
        }
      );

      await CommentsTableTestHelper.addComment(
        {
          id: 'comment-123',
          content: 'isi-komen', 
          thread_id: 'thread-123', 
          owner_username: 'dicoding',
          is_deleted: false,
        }
      );

      await RepliesTableTestHelper.addReply(
        {
          id: 'reply-123',
          content: 'isi-reply', 
          comment_id: 'comment-123', 
          owner_username: 'john',
          is_deleted: false,
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak dapat menghapus balasan yang bukan milik anda');
    });

    it('should response 400 when reply has been deleted before', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread(
        {
          id: 'thread-123',
          title: 'thread-title',
          body: 'thread-body',
          owner_username: 'dicoding'
        }
      );

      await CommentsTableTestHelper.addComment(
        {
          id: 'comment-123',
          content: 'isi-komen', 
          thread_id: 'thread-123', 
          owner_username: 'dicoding',
          is_deleted: true,
        }
      );

      await RepliesTableTestHelper.addReply(
        {
          id: 'reply-123',
          content: 'isi-reply', 
          comment_id: 'comment-123', 
          owner_username: 'dicoding',
          is_deleted: true,
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('balasan telah dihapus');
    });

    it('should response 404 when reply is not found', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread(
        {
          id: 'thread-123',
          title: 'thread-title',
          body: 'thread-body',
          owner_username: 'dicoding'
        }
      );

      await CommentsTableTestHelper.addComment(
        {
          id: 'comment-123',
          content: 'isi-komen', 
          thread_id: 'thread-123', 
          owner_username: 'dicoding',
          is_deleted: true,
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply tidak ditemukan');
    });

    it('should response 404 when comment is invalid', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread(
        {
          id: 'thread-123',
          title: 'thread-title',
          body: 'thread-body',
          owner_username: 'dicoding'
        }
      );

      await RepliesTableTestHelper.addReply(
        {
          id: 'reply-123',
          content: 'isi-reply', 
          comment_id: 'comment-123', 
          owner_username: 'dicoding',
          is_deleted: true,
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/replies-123',
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 404 when thread is invalid', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment(
        {
          id: 'comment-123',
          content: 'isi-komen', 
          thread_id: 'thread-123', 
          owner_username: 'dicoding',
          is_deleted: true,
        }
      );

      await RepliesTableTestHelper.addReply(
        {
          id: 'reply-123',
          content: 'isi-reply', 
          comment_id: 'comment-123', 
          owner_username: 'dicoding',
          is_deleted: true,
        }
      );

      const server = await createServer(container);

      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);

      const headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken}`
      }

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/replies-123',
        headers: headers
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});