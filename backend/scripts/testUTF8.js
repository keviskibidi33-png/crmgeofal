const http = require('http');

async function testUTF8() {
  console.log('🧪 Probando UTF-8 en API...\n');

  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/ensayos/temp?page=1&limit=3',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    console.log(`Charset: ${res.headers['content-type']?.includes('charset=utf-8') ? 'UTF-8' : 'No UTF-8'}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('\n📊 Datos recibidos:');
        json.data.forEach(item => {
          console.log(`${item.codigo}: ${item.descripcion}`);
          console.log(`  Bytes: ${Buffer.from(item.descripcion, 'utf8').toString('hex')}`);
        });
      } catch (error) {
        console.error('Error parsing JSON:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
  });

  req.end();
}

testUTF8();
