module.exports = async function handler(req, res) {
  const { code } = req.query;

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      code,
    }),
  });

  const { access_token, error } = await response.json();

  const payload = JSON.stringify({ status: error ? 'error' : 'success', token: access_token })
    .replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  res.setHeader('Content-Type', 'text/html');
  res.end(`<!DOCTYPE html><html><body>
<script id="p" type="application/json">${payload}</script>
<script>
(function(){
  var d=JSON.parse(document.getElementById('p').textContent);
  var msg=d.status==='success'
    ? 'authorization:github:success:'+JSON.stringify({token:d.token,provider:'github'})
    : 'authorization:github:error';
  function r(e){window.opener.postMessage(msg,e.origin);}
  window.addEventListener('message',r,false);
  window.opener.postMessage('authorizing:github','*');
})();
</script></body></html>`);
};