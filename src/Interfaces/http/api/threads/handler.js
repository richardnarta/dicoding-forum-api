const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase');
const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const ManageCommentUseCase = require('../../../../Applications/use_case/ManageCommentUseCase');
const ManageReplyUseCase = require('../../../../Applications/use_case/ManageReplyUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.getThreadHandler = this.getThreadHandler.bind(this);
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async getThreadHandler(request, h) {
    const { threadId } = request.params;

    const getThreadUserUseCase = this._container.getInstance(GetThreadUseCase.name);
    const data = await getThreadUserUseCase.execute(threadId);

    return h.response({
      status: 'success',
      data: { thread: data },
    }).code(200);
  }

  async postThreadHandler(request, h) {
    const credentials = request.auth.artifacts.decoded.payload;

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const data = await addThreadUseCase.execute(credentials, request.payload)

    return h.response({
      status: 'success',
      data: { addedThread: data },
    }).code(201);
  }

  async postCommentHandler(request, h) {
    const credentials = request.auth.artifacts.decoded.payload;
    const { threadId } = request.params;

    const manageCommentUseCase = this._container.getInstance(ManageCommentUseCase.name);
    const data = await manageCommentUseCase.addComment(credentials, threadId, request.payload);

    return h.response({
      status: 'success',
      data: { addedComment: data },
    }).code(201);
  }

  async postReplyHandler(request, h) {
    const credentials = request.auth.artifacts.decoded.payload;
    const { threadId, commentId } = request.params;

    const manageReplyUseCase = this._container.getInstance(ManageReplyUseCase.name);
    const data = await manageReplyUseCase.addReply(credentials, threadId, commentId, request.payload);

    return h.response({
      status: 'success',
      data: { addedReply: data },
    }).code(201);
  }

  async deleteCommentHandler(request, h) {
    const credentials = request.auth.artifacts.decoded.payload;
    const { threadId, commentId } = request.params;

    const manageCommentUseCase = this._container.getInstance(ManageCommentUseCase.name);
    await manageCommentUseCase.deleteComment(credentials, threadId, commentId);

    return h.response({ status: 'success' }).code(200);
  }

  async deleteReplyHandler(request, h) {
    const credentials = request.auth.artifacts.decoded.payload;
    const { threadId, commentId, replyId } = request.params;

    const manageReplyUseCase = this._container.getInstance(ManageReplyUseCase.name);
    await manageReplyUseCase.deleteReply(credentials, threadId, commentId, replyId);

    return h.response({ status: 'success' }).code(200);
  }
}

module.exports = ThreadsHandler;