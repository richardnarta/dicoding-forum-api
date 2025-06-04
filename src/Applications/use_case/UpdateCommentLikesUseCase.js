class UpdateCommentLikesUseCase {
  constructor ({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }
  
  async execute(credential, threadId, commentId) {
    const status = await this.verifyCommentLike(threadId, commentId, credential.username);

    if (status) {
      await this._commentRepository.deleteCommentLike({
        commentId: commentId,
        username: credential.username
      });
    } else {
      await this._commentRepository.addCommentLike({
        commentId: commentId,
        username: credential.username
      });
    }
  }

  async verifyCommentLike(threadId, commentId, username) {
    await this._threadRepository.isThreadAvailable(threadId);

    const comment = await this._commentRepository.getCommentById(commentId);

    if (comment.is_deleted) {
      throw new Error('UPDATE_COMMENT_LIKE_USE_CASE.COMMENT_HAS_BEEN_DELETED');
    }

    return await this._commentRepository.isCommentLikedByUser({
      commentId: commentId,
      username: username
    });
  }
}

module.exports = UpdateCommentLikesUseCase;