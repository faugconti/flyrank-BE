const { UpstreamError } = require('../errors');

exports.enrich = async () => {
  throw new UpstreamError('LLM integration not wired yet');
};
