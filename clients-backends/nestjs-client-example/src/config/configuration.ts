export default () => ({
  port: parseInt(process.env.NEST_CLIENT_PORT, 10) || 3000,
});
