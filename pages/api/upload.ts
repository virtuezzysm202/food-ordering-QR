// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { Part } from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

const uploadDir = path.join(process.cwd(), '/public/uploads')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    filename: (name: string, ext: string, part: Part) =>
      `${Date.now()}-${part.originalFilename?.replace(/\s/g, '-')}`,
  })

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload failed' })

    const file = Array.isArray(files.file) ? files.file[0] : files.file
    const fileName = file ? path.basename(file.filepath) : null

    res.status(200).json({ fileName })
  })
}
