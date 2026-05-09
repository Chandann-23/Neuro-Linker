'use client'

import { useState } from 'react'
import { Upload, X, FileText, CheckCircle } from 'lucide-react'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (files: File[]) => void
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    setUploadedFiles(files)
    onUpload(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles(files)
    onUpload(files)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Upload Resumes</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag & Drop PDF Resumes
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files
            </p>
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
            >
              <FileText size={20} className="mr-2" />
              Select PDF Files
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-700">
                <CheckCircle size={20} className="mr-2" />
                <span className="font-medium">
                  {uploadedFiles.length} file{uploadedFiles.length === 1 ? '' : 's'} ready for processing
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="text-gray-700">
                    {file.name} ({Math.round(file.size / 1024)} KB)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
