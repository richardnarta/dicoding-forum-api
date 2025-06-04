const InvariantError = require('./InvariantError');
const AuthorizationError = require('./AuthorizationError');

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),
  'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
  'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),
  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'THREAD_USE_CASE.PAYLOAD_INVALID': new InvariantError('harus mengirimkan payload title dan body'),
  'MANAGE_COMMENT_USE_CASE.NO_CONTENT': new InvariantError('harus mengirimkan payload content'),
  'MANAGE_REPLY_USE_CASE.NO_CONTENT': new InvariantError('harus mengirimkan payload content'),
  'ADD_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('title dan body harus string'),
  'MANAGE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('content harus string'),
  'MANAGE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('content harus string'),
  'MANAGE_COMMENT_USE_CASE.NOT_THE_OWNER_OF_COMMENT': new AuthorizationError('anda tidak dapat menghapus comment yang bukan milik anda'),
  'MANAGE_COMMENT_USE_CASE.COMMENT_HAS_BEEN_DELETED': new InvariantError('komentar telah dihapus'),
  'MANAGE_REPLY_USE_CASE.NOT_THE_OWNER_OF_REPLY': new AuthorizationError('anda tidak dapat menghapus balasan yang bukan milik anda'),
  'MANAGE_REPLY_USE_CASE.REPLY_HAS_BEEN_DELETED': new InvariantError('balasan telah dihapus'),
  'UPDATE_COMMENT_LIKE_USE_CASE.COMMENT_HAS_BEEN_DELETED': new InvariantError('komentar telah dihapus'),
};

module.exports = DomainErrorTranslator;
