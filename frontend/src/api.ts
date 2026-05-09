// API Configuration for NEURO-LINKER Backend

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://chandann-23-neuro-linker-api.hf.space'

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
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          alpha: 0.7,
          filters
        }),
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`)
      }

      const results = await response.json()
      return results
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  static async uploadFiles(files: File[]): Promise<any> {
    try {
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`files`, file)
      })

      const response = await fetch(`${API_BASE_URL}/upload`, {
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
