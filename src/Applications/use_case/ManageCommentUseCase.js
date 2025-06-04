class ManageCommentUseCase {
  constructor ({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async addComment(credential, threadId, payload) {
    this._verifyPostPayload(payload);

    await this._threadRepository.isThreadAvailable(threadId);

    const { content } = payload;

    const result = await this._commentRepository.addComment(
      {
        content: content, 
        threadId: threadId, 
        ownerUsername: credential.username,
      }
    )

    return {
      id: result.id,
      content: result.content,
      owner: credential.id
    }
  }

  async deleteComment(credential, threadId, commentId) {
    await this._verifyCommentDeletion(threadId, commentId, credential.username);

    const result = await this._commentRepository.deleteCommentById(commentId);

    return result.is_deleted;
  }

  _verifyPostPayload(payload) {
    const { content } = payload;

    if (!content) {
      throw new Error('MANAGE_COMMENT_USE_CASE.NO_CONTENT');
    }

    if (typeof content !== 'string') {
      throw new Error('MANAGE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  async _verifyCommentDeletion(threadId, commentId, username) {
    await this._threadRepository.isThreadAvailable(threadId);

    const comment = await this._commentRepository.getCommentById(commentId);

    if (comment.owner_username !== username) {
      throw new Error('MANAGE_COMMENT_USE_CASE.NOT_THE_OWNER_OF_COMMENT');
    }

    if (comment.is_deleted) {
      throw new Error('MANAGE_COMMENT_USE_CASE.COMMENT_HAS_BEEN_DELETED');
    }
  }
}

module.exports = ManageCommentUseCase;