class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);

    const formattedComments = [];
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = comments.map(comment => comment.id);

    let replies = [];

    replies = await this._replyRepository.getRepliesByCommentId(commentIds);

    const repliesMap = new Map();

    for (const reply of replies) {

      if (reply.is_deleted) {
        reply.content = "**balasan telah dihapus**";
      }

      const formattedReply = {
        id: reply.id,
        content: reply.content,
        date: reply.timestamp,
        username: reply.owner_username,
      };

      if (!repliesMap.has(reply.comment_id)) {
        repliesMap.set(reply.comment_id, []);
      }
      repliesMap.get(reply.comment_id).push(formattedReply);
    }

    for (const comment of comments) {
      if (comment.is_deleted) {
        comment.content = "**komentar telah dihapus**";
      }

      const commentReplies = repliesMap.get(comment.id) || [];

      formattedComments.push(
        {
          id: comment.id,
          username: comment.owner_username,
          date: comment.timestamp,
          replies: commentReplies,
          content: comment.content
        }
      );
    }

    return {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.timestamp,
      username: thread.owner_username,
      comments: formattedComments
    }
  }
}

module.exports = GetThreadUseCase;