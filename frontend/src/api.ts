// API Configuration for NEURO-LINKER Backend

const API_BASE = 'https://chandann-23-neuro-linker-api.hf.space';

export interface SearchRequest {
  query: string
  alpha: number
  filters: {
    experience_level?: string
    location?: string
    skills?: string[]
  }
}

export interface SearchResult {
  id: string
  filename: string
  score: number
  semantic_score: number
  keyword_score: number
  matched_chunk: string
  content_preview: {
    filename: string
    content: string
    education: string
    skills: string[]
    projects: string[]
  }
}

export class ApiService {
  static async search(query: string, filters: any = {}): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          alpha: 0.7,
          filters
        }),
        signal: AbortSignal.timeout(60000) // 60 second timeout
      })

      // Fail-fast JSON validator
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Backend returned non-JSON or error');
      }

      const data = await response.json();
      return Array.isArray(data) ? data : []; // Default array guard
    } catch (error) {
      console.error('API Error:', error)
      return []; // Safety fallback
    }
  }

  static async uploadFiles(files: File[]): Promise<any> {
    try {
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`files`, file)
      })

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Upload Error:', error)
      throw error
    }
  }
}
