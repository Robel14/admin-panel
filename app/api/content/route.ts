import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { ContentType } from "@/app/actions/content"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") as ContentType | null
    const id = searchParams.get("id")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 10

    // If ID is provided, fetch a specific content item
    if (id && type) {
      const result = await sql`
        SELECT * FROM content.${sql(type)} 
        WHERE id = ${Number.parseInt(id)}
      `

      if (result.length === 0) {
        return NextResponse.json({ success: false, error: "Content not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true, data: result[0] })
    }

    // If type is provided, fetch all content of that type
    if (type) {
      const result = await sql`
        SELECT * FROM content.${sql(type)} 
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `

      return NextResponse.json({ success: true, data: result })
    }

    // If no type is provided, fetch recent content from all types
    const [news, images, videos, audios, volunteerWork, pdfs] = await Promise.all([
      sql`SELECT id, title, 'news' as type, created_at FROM content.news ORDER BY created_at DESC LIMIT ${limit}`,
      sql`SELECT id, title, 'images' as type, created_at FROM content.images ORDER BY created_at DESC LIMIT ${limit}`,
      sql`SELECT id, title, 'videos' as type, created_at FROM content.videos ORDER BY created_at DESC LIMIT ${limit}`,
      sql`SELECT id, title, 'audios' as type, created_at FROM content.audios ORDER BY created_at DESC LIMIT ${limit}`,
      sql`SELECT id, title, 'volunteer_work' as type, created_at FROM content.volunteer_work ORDER BY created_at DESC LIMIT ${limit}`,
      sql`SELECT id, title, 'pdfs' as type, created_at FROM content.pdfs ORDER BY created_at DESC LIMIT ${limit}`,
    ])

    // Combine and sort by created_at
    const combined = [...news, ...images, ...videos, ...audios, ...volunteerWork, ...pdfs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)

    return NextResponse.json({ success: true, data: combined })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    if (!type || !data) {
      return NextResponse.json({ success: false, error: "Type and data are required" }, { status: 400 })
    }

    // Extract keys and values from the data object
    const keys = Object.keys(data).filter((key) => data[key] !== undefined && data[key] !== "")
    const values = keys.map((key) => data[key])

    // Create placeholders for the SQL query
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ")

    // Create the columns string
    const columns = keys.join(", ")

    // Create the SQL query
    const query = `
      INSERT INTO content.${type} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `

    const result = await sql.query(query, values)

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
