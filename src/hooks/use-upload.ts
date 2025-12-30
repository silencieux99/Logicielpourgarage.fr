import { useState, useCallback } from 'react'

interface UploadedFile {
    id: string
    url: string
    pathname: string
    name: string
    size: number
    type: 'avant' | 'apres' | 'general'
    preview?: string
    uploading?: boolean
    error?: string
}

interface UseUploadOptions {
    folder?: string
    maxFiles?: number
    onUploadComplete?: (file: UploadedFile) => void
    onUploadError?: (error: string) => void
}

export function useUpload(options: UseUploadOptions = {}) {
    const { folder = 'uploads', maxFiles = 20, onUploadComplete, onUploadError } = options
    const [files, setFiles] = useState<UploadedFile[]>([])
    const [uploading, setUploading] = useState(false)

    const uploadFile = useCallback(async (file: File, type: UploadedFile['type'] = 'general'): Promise<UploadedFile | null> => {
        const tempId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        const preview = URL.createObjectURL(file)

        // Add temporary entry with uploading state
        const tempFile: UploadedFile = {
            id: tempId,
            url: '',
            pathname: '',
            name: file.name,
            size: file.size,
            type,
            preview,
            uploading: true,
        }

        setFiles(prev => [...prev, tempFile])

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', folder)

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed')
            }

            const uploadedFile: UploadedFile = {
                id: tempId,
                url: data.url,
                pathname: data.pathname,
                name: file.name,
                size: data.size,
                type,
                preview,
                uploading: false,
            }

            setFiles(prev => prev.map(f => f.id === tempId ? uploadedFile : f))
            onUploadComplete?.(uploadedFile)

            return uploadedFile
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed'

            setFiles(prev => prev.map(f =>
                f.id === tempId ? { ...f, uploading: false, error: errorMessage } : f
            ))

            onUploadError?.(errorMessage)
            return null
        }
    }, [folder, onUploadComplete, onUploadError])

    const uploadFiles = useCallback(async (fileList: FileList | File[], type: UploadedFile['type'] = 'general') => {
        const filesArray = Array.from(fileList)

        if (files.length + filesArray.length > maxFiles) {
            onUploadError?.(`Maximum ${maxFiles} fichiers autorisés`)
            return []
        }

        setUploading(true)

        const results = await Promise.all(
            filesArray.map(file => uploadFile(file, type))
        )

        setUploading(false)

        return results.filter((f): f is UploadedFile => f !== null)
    }, [files.length, maxFiles, uploadFile, onUploadError])

    const removeFile = useCallback(async (id: string) => {
        const file = files.find(f => f.id === id)
        if (!file) return

        // Clean up preview URL
        if (file.preview) {
            URL.revokeObjectURL(file.preview)
        }

        // Delete from Vercel Blob if uploaded
        if (file.url) {
            try {
                await fetch(`/api/upload?url=${encodeURIComponent(file.url)}`, {
                    method: 'DELETE',
                })
            } catch (error) {
                console.error('Error deleting file:', error)
            }
        }

        setFiles(prev => prev.filter(f => f.id !== id))
    }, [files])

    const clearFiles = useCallback(() => {
        files.forEach(file => {
            if (file.preview) {
                URL.revokeObjectURL(file.preview)
            }
        })
        setFiles([])
    }, [files])

    const getFilesByType = useCallback((type: UploadedFile['type']) => {
        return files.filter(f => f.type === type)
    }, [files])

    return {
        files,
        uploading,
        uploadFile,
        uploadFiles,
        removeFile,
        clearFiles,
        getFilesByType,
    }
}

export type { UploadedFile }
