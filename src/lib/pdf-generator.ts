"use client"

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function generatePDF(elementId: string, filename: string): Promise<void> {
    try {
        // Get the element to convert
        const element = document.getElementById(elementId)
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`)
        }

        // Wait a bit for any dynamic content to render
        await new Promise(resolve => setTimeout(resolve, 100))

        // Create canvas from HTML element with high quality
        const canvas = await html2canvas(element, {
            scale: 2, // Higher quality
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: element.scrollWidth,
            height: element.scrollHeight,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        })

        // A4 dimensions in mm
        const pdfWidth = 210
        const pdfHeight = 297

        // Calculate image dimensions to fit A4
        const imgWidth = pdfWidth
        const imgHeight = (canvas.height * pdfWidth) / canvas.width

        // Create PDF - single page, fit to page
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        })

        // If content is taller than A4, scale it down to fit
        if (imgHeight > pdfHeight) {
            const scaleFactor = pdfHeight / imgHeight
            const scaledWidth = imgWidth * scaleFactor
            const scaledHeight = pdfHeight
            const xOffset = (pdfWidth - scaledWidth) / 2

            pdf.addImage(
                canvas.toDataURL('image/jpeg', 0.95),
                'JPEG',
                xOffset,
                0,
                scaledWidth,
                scaledHeight,
                undefined,
                'FAST'
            )
        } else {
            // Content fits on one page
            pdf.addImage(
                canvas.toDataURL('image/jpeg', 0.95),
                'JPEG',
                0,
                0,
                imgWidth,
                imgHeight,
                undefined,
                'FAST'
            )
        }

        // Save the PDF
        pdf.save(filename)
    } catch (error) {
        console.error('Error generating PDF:', error)
        throw error
    }
}
