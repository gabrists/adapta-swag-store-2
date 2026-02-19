import { toast } from '@/hooks/use-toast'

/**
 * Simulates uploading a file to Cloudflare R2.
 * In a real production environment, this would likely:
 * 1. Request a signed URL from the backend
 * 2. PUT the file to the signed URL
 * 3. Return the public R2 URL
 *
 * For this demo, we simulate the network delay and return a Data URI
 * to ensure the image works within the local browser storage.
 */
export async function uploadToR2(file: File): Promise<string> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error(
      'Formato de arquivo inválido. Apenas imagens são permitidas.',
    )
  }

  // Validate file size (e.g. 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Arquivo muito grande. O tamanho máximo é 5MB.')
  }

  // Simulate network latency for R2 upload (1.5s - 3s)
  const delay = Math.random() * 1500 + 1500
  await new Promise((resolve) => setTimeout(resolve, delay))

  // Simulate success/failure (95% success rate)
  if (Math.random() > 0.95) {
    throw new Error('Falha no upload para Cloudflare R2. Tente novamente.')
  }

  // Return Data URI to simulate the "Public URL"
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Falha ao processar arquivo de imagem.'))
      }
    }
    reader.onerror = () => reject(new Error('Erro na leitura do arquivo.'))
    reader.readAsDataURL(file)
  })
}
