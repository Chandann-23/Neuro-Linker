'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface UploadZoneProps {
  onUpload: (files: File[]) => void
  uploadProgress: { [key: string]: any }
}

export function UploadZone({ onUpload, uploadProgress }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'application/pdf'
    )
    
    if (files.length > 0) {
      setSelectedFiles(files)
      onUpload(files)
    }
  }, [onUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type === 'application/pdf'
    )
    
    if (files.length > 0) {
      setSelectedFiles(files)
      onUpload(files)
    }
  }, [onUpload])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="glass p-6">
        <h3 className="text-xl font-bold mb-4 gradient-text">Inject PDF Data</h3>
        
        <div
          className={`upload-zone ${isDragOver ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto mb-4" size={48} style={{ color: 'var(--accent-purple)' }} />
          <p className="text-lg font-semibold mb-2">Drop PDF files here or click to browse</p>
          <p className="text-sm opacity-70">Supports PDF format only</p>
          
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="btn-primary inline-block mt-4 cursor-pointer"
          >
            Select Files
          </label>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="glass p-6">
          <h3 className="text-xl font-bold mb-4 gradient-text">Processing Status</h3>
          <div className="space-y-4">
            {Object.entries(uploadProgress).map(([taskId, progress]) => (
              <div key={taskId} className="border-l-4 pl-4" style={{ borderColor: 'var(--accent-purple)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {progress.status === 'processing' && (
                      <Clock className="animate-spin" size={16} style={{ color: 'var(--accent-pink)' }} />
                    )}
                    {progress.status === 'completed' && (
                      <CheckCircle size={16} style={{ color: '#22c55e' }} />
                    )}
                    {progress.status === 'failed' && (
                      <AlertCircle size={16} style={{ color: '#ef4444' }} />
                    )}
                    <span className="font-medium capitalize">{progress.status}</span>
                  </div>
                  <span className="text-sm opacity-70">
                    {progress.processed_files || 0} / {progress.total_files || 0}
                  </span>
                </div>
                
                {progress.message && (
                  <p className="text-sm opacity-80 mb-2">{progress.message}</p>
                )}
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${progress.total_files > 0 ? (progress.processed_files / progress.total_files) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && Object.keys(uploadProgress).length === 0 && (
        <div className="glass p-6">
          <h3 className="text-xl font-bold mb-4 gradient-text">Selected Files</h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 rounded-lg" style={{ backgroundColor: 'var(--accent-navy)' }}>
                <FileText size={20} style={{ color: 'var(--accent-purple)' }} />
                <div className="flex-1">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm opacity-70">{formatFileSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
