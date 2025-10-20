#!/usr/bin/env tsx

/**
 * Kullanılmayan dosyaları temizleme scripti
 * Bu script, kullanılmayan component ve icon dosyalarını bulur ve siler
 */

import { glob } from 'glob'
import { readFileSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'

interface ImportInfo {
  file: string
  imports: string[]
}

async function findUnusedFiles() {
  console.log('🔍 Kullanılmayan dosyaları arıyorum...')

  // Tüm TypeScript/JavaScript dosyalarını bul
  const allFiles = await glob('**/*.{ts,tsx,js,jsx}', {
    ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**'],
  })

  // Tüm import'ları topla
  const imports: ImportInfo[] = []
  
  for (const file of allFiles) {
    try {
      const content = readFileSync(file, 'utf-8')
      const importMatches = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || []
      const dynamicImports = content.match(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g) || []
      
      const fileImports = [
        ...importMatches.map(match => {
          const matchResult = match.match(/from\s+['"]([^'"]+)['"]/)
          return matchResult ? matchResult[1] : ''
        }),
        ...dynamicImports.map(match => {
          const matchResult = match.match(/['"]([^'"]+)['"]/)
          return matchResult ? matchResult[1] : ''
        })
      ].filter(Boolean)

      imports.push({
        file,
        imports: fileImports,
      })
    } catch (error) {
      console.warn(`⚠️  ${file} okunamadı:`, error)
    }
  }

  // Component dosyalarını bul
  const componentFiles = await glob('components/**/*.{ts,tsx}', {
    ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**'],
  })

  // Icon dosyalarını bul
  const iconFiles = await glob('**/icons/**/*.{ts,tsx,svg}', {
    ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**'],
  })

  // Kullanılmayan dosyaları bul
  const unusedFiles: string[] = []

  for (const file of [...componentFiles, ...iconFiles]) {
    const relativePath = file.replace(/\.(ts|tsx|svg)$/, '')
    const possibleImports = [
      `./${relativePath}`,
      `../${relativePath}`,
      `@/${relativePath}`,
      relativePath,
    ]

    const isUsed = imports.some(importInfo => 
      importInfo.imports.some(imp => 
        possibleImports.some(possible => imp.includes(possible))
      )
    )

    if (!isUsed) {
      unusedFiles.push(file)
    }
  }

  return unusedFiles
}

async function cleanupUnusedFiles() {
  try {
    const unusedFiles = await findUnusedFiles()

    if (unusedFiles.length === 0) {
      console.log('✅ Kullanılmayan dosya bulunamadı!')
      return
    }

    console.log(`📁 ${unusedFiles.length} kullanılmayan dosya bulundu:`)
    unusedFiles.forEach(file => console.log(`  - ${file}`))

    // Kullanıcıdan onay al
    const readline = await import('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const answer = await new Promise<string>((resolve) => {
      rl.question('\n❓ Bu dosyaları silmek istiyor musunuz? (y/N): ', resolve)
    })

    rl.close()

    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      let deletedCount = 0
      
      for (const file of unusedFiles) {
        try {
          if (existsSync(file)) {
            unlinkSync(file)
            console.log(`🗑️  Silindi: ${file}`)
            deletedCount++
          }
        } catch (error) {
          console.error(`❌ ${file} silinemedi:`, error)
        }
      }

      console.log(`\n✅ ${deletedCount} dosya başarıyla silindi!`)
    } else {
      console.log('❌ İşlem iptal edildi.')
    }
  } catch (error) {
    console.error('❌ Hata oluştu:', error)
    process.exit(1)
  }
}

// Script'i çalıştır
if (require.main === module) {
  cleanupUnusedFiles()
}

export { cleanupUnusedFiles, findUnusedFiles }
