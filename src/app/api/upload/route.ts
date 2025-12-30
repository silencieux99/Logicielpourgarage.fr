import { put, del } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const folder = formData.get('folder') as string || 'uploads'

        if (!file) {
            return NextResponse.json(
                { error: 'Aucun fichier fourni' },
                { status: 400 }
            )
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.' },
                { status: 400 }
            )
        }

        // Limit file size to 10MB
        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'Fichier trop volumineux. Limite: 10 Mo' },
                { status: 400 }
            )
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 8)
        const extension = file.name.split('.').pop() || 'jpg'
        const filename = `${folder}/${timestamp}-${randomStr}.${extension}`

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
            addRandomSuffix: false,
        })

        return NextResponse.json({
            success: true,
            url: blob.url,
            pathname: blob.pathname,
            size: file.size,
        })
    } catch (error) {
        console.error('Erreur upload blob:', error)
        return NextResponse.json(
            { error: 'Erreur lors de l\'upload' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const url = searchParams.get('url')

        if (!url) {
            return NextResponse.json(
                { error: 'URL du fichier requise' },
                { status: 400 }
            )
        }

        await del(url)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Erreur suppression blob:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la suppression' },
            { status: 500 }
        )
    }
}
