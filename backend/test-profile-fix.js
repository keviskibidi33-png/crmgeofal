const https = require('https');
const http = require('http');

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const protocol = options.port === 443 ? https : http;
        const req = protocol.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(body)
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: body
                    });
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testProfileUpdate() {
    console.log('🔧 Probando actualización de perfil...\n');
    
    try {
        // 1. Login para obtener token
        console.log('1. Haciendo login...');
        const loginOptions = {
            hostname: 'localhost',
            port: 4000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };
        
        const loginResult = await makeRequest(loginOptions, {
            email: 'admin@crm.com',
            password: 'admin123'
        });
        
        if (loginResult.status !== 200 || !loginResult.data.token) {
            throw new Error('No se pudo obtener token: ' + JSON.stringify(loginResult.data));
        }
        console.log('✅ Login exitoso');
        
        const token = loginResult.data.token;
        
        // 2. Actualizar perfil
        console.log('\n2. Actualizando perfil...');
        const updateOptions = {
            hostname: 'localhost',
            port: 4000,
            path: '/api/auth/me',
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            }
        };
        
        const updateResult = await makeRequest(updateOptions, {
            name: 'Administrador Corregido',
            apellido: 'Sistema Funcionando',
            email: 'admin@crm.com'
        });
        
        if (updateResult.status === 200) {
            console.log('✅ Perfil actualizado exitosamente');
            console.log('📝 Datos actualizados:', updateResult.data.user);
        } else {
            console.log('❌ Error actualizando perfil:', updateResult.data);
        }
        
        console.log('\n✅ Prueba completada');
        
    } catch (error) {
        console.error('\n❌ Error en la prueba:', error.message);
    }
}

testProfileUpdate();