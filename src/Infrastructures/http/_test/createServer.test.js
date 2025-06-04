const createServer = require('../createServer');
const Jwt = require('@hapi/jwt');

describe('HTTP server', () => {
  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const server = await createServer({});

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/unregisteredRoute',
    });

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it('should return 401 when no token is provided in requesting registered route', async () => {
    // Arrange
    const server = await createServer({});

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
    });

    // Assert
    expect(response.statusCode).toEqual(401);
  });

  it('should authenticate request and trigger validate function', async () => {
    // Arrange
    const server = await createServer({});
    const accessToken = Jwt.token.generate(
      {
        id: 'user-123'
      },
      process.env.ACCESS_TOKEN_KEY
    )

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });

    expect([401, 500, 201]).toContain(response.statusCode);
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const server = await createServer({}); // fake injection

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });
});
