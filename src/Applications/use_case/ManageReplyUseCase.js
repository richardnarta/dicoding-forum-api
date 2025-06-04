class ManageReplyUseCase {
  constructor ({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async addReply(credential, threadId, commentId, payload) {
    this._verifyPostPayload(payload);

    await this._threadRepository.isThreadAvailable(threadId);
    await this._commentRepository.isCommentAvailable(commentId);

    const { content } = payload;

    const result = await this._replyRepository.addReply(
      {
        content: content, 
        commentId: commentId, 
        ownerUsername: credential.username,
      }
    )

    return {
      id: result.id,
      content: result.content,
      owner: credential.id
    }
  }

  async deleteReply(credential, threadId, commentId, replyId) {
    await this._verifyReplyDeletion(threadId, commentId, replyId, credential.username);

    const result = await this._replyRepository.deleteReplyById(replyId);

    return result.is_deleted;
  }

  _verifyPostPayload(payload) {
    const { content } = payload;

    if (!content) {
      throw new Error('MANAGE_REPLY_USE_CASE.NO_CONTENT');
    }

    if (typeof content !== 'string') {
      throw new Error('MANAGE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  async _verifyReplyDeletion(threadId, commentId, replyId, username) {
    await this._threadRepository.isThreadAvailable(threadId);
    await this._commentRepository.isCommentAvailable(commentId);

    const reply = await this._replyRepository.getReplyById(replyId);

    if (reply.owner_username !== username) {
      throw new Error('MANAGE_REPLY_USE_CASE.NOT_THE_OWNER_OF_REPLY');
    }

    if (reply.is_deleted) {
      throw new Error('MANAGE_REPLY_USE_CASE.REPLY_HAS_BEEN_DELETED');
    }
  }
}

module.exports = ManageReplyUseCase;