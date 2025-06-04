class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(credential, payload) {
    this._verifyPostPayload(payload);

    const { title, body } = payload;

    const result = await this._threadRepository.addThread(
      { 
        title: title, 
        body: body, 
        ownerUsername: credential.username
      }
    )

    return {
      id: result.id,
      title: result.title,
      owner: credential.id
    }
  }

  _verifyPostPayload(payload) {
    const { title, body } = payload;

    if (!title || !body) {
      throw new Error('THREAD_USE_CASE.PAYLOAD_INVALID');
    }

    if (typeof title !== 'string' || typeof body !== 'string') {
      throw new Error('ADD_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddThreadUseCase;