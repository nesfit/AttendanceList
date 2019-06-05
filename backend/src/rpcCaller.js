import https from 'https';
import request from 'request';

import config from './config';
import state from './state';

const agent = new https.Agent(config.rpcAgentOptions);

const call = (a, token, url, template, handler) => request(url, {
  method: 'POST',
  agent: a,
  headers: {
    Authorization: 'Basic ' + token,
  },
  body: template,
}, handler);

const rpcCaller = (params, handler) => {
  const {
    cabbr,
    acyear,
    sem,
    item,
    login,
    points,
    assessment,
    teacher,
    date,
    update,
  } = params;

  const template = `<?xml version="1.0"?>
<methodCall>
	<methodName>courses.set_item_points</methodName>
	<params>
		<param><value><string>${cabbr}</string></value></param>
		<param><value><int>${acyear}</int></value></param>
		<param><value><string>${sem}</string></value></param>
		<param><value><int>${item}</int></value></param>
		<param><value><string>${login}</string></value></param>
		<param><value><double>${points}</double></value></param>
		<param><value><string>${assessment}</string></value></param>
		<param><value><string>${teacher}</string></value></param>
		<param><value><datetime.iso8601>${date}</datetime.iso8601></value></param>
		<param><value><int>${update}</int></value></param>
	</params>
</methodCall>
`;

  const token = state.authToken.get();

  const url = 'https://wis.fit.vutbr.cz/FIT/db/vyuka/ucitel/course-item-xml.php';

  return call(agent, token, url, template, handler);
};

export default rpcCaller;
