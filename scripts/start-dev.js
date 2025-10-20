#!/usr/bin/env node

/**
 * Geliştirme sunucusunu her zaman port 3000'de başlatır
 * Port 3000 kullanımda ise uyarı verir ve durur
 */

const { spawn } = require('child_process')
const net = require('net')

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.listen(port, () => {
      server.once('close', () => {
        resolve(false)
      })
      server.close()
    })
    server.on('error', () => {
      resolve(true)
    })
  })
}

async function startDevServer() {
  const port = 3000
  
  console.log(`🔍 Port ${port} kontrol ediliyor...`)
  
  const portInUse = await isPortInUse(port)
  
  if (portInUse) {
    console.log(`❌ Port ${port} kullanımda!`)
    console.log(`💡 Lütfen port ${port}'i kullanan uygulamayı durdurun veya farklı bir port kullanın.`)
    console.log(`🔧 Alternatif: npm run dev -- -p 3001`)
    process.exit(1)
  }
  
  console.log(`✅ Port ${port} kullanılabilir`)
  console.log(`🚀 Geliştirme sunucusu başlatılıyor...`)
  
  const child = spawn('npx', ['next', 'dev', '-p', port.toString()], {
    stdio: 'inherit',
    shell: true
  })
  
  child.on('error', (error) => {
    console.error('❌ Hata:', error)
    process.exit(1)
  })
  
  child.on('exit', (code) => {
    console.log(`📝 Sunucu durdu (kod: ${code})`)
    process.exit(code)
  })
}

startDevServer()
