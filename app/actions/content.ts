"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type ContentType = "news" | "images" | "videos" | "audios" | "volunteer_work" | "pdfs"

// Generic function to get content by type
export async function getContentByType(type: ContentType, limit = 10) {
  try {
    const result = await sql`
      SELECT * FROM content.${sql(type)} 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `
    return { success: true, data: result }
  } catch (error) {
    console.error(`Error fetching ${type}:`, error)
    return { success: false, error: `Failed to fetch ${type}` }
  }
}

// Function to get a single content item by ID
export async function getContentById(type: ContentType, id: number) {
  try {
    const result = await sql`
      SELECT * FROM content.${sql(type)} 
      WHERE id = ${id}
    `
    return { success: true, data: result[0] }
  } catch (error) {
    console.error(`Error fetching ${type} with ID ${id}:`, error)
    return { success: false, error: `Failed to fetch ${type} with ID ${id}` }
  }
}

// Function to create content
export async function createContent(type: ContentType, data: any) {
  try {
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

    // Execute the query
    const result = await sql.query(query, values)

    // Check if result.rows exists and has at least one element
    if (!result.rows || result.rows.length === 0) {
      throw new Error("No data returned from insert operation")
    }

    // Revalidate the content path to update the UI
    revalidatePath("/")

    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error(`Error creating ${type}:`, error)
    return { success: false, error: `Failed to create ${type}: ${error}` }
  }
}

// Function to update content
export async function updateContent(type: ContentType, id: number, data: any) {
  try {
    // Extract keys and values from the data object
    const updates = Object.entries(data)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([key, _], index) => `${key} = $${index + 1}`)
      .join(", ")

    const values = Object.entries(data)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([_, value]) => value)

    // Add the ID to the values array
    values.push(id)

    // Create the SQL query
    const query = `
      UPDATE content.${type}
      SET ${updates}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length}
      RETURNING *
    `

    const result = await sql.query(query, values)

    // Check if result.rows exists and has at least one element
    if (!result.rows || result.rows.length === 0) {
      throw new Error("No data returned from update operation")
    }

    // Revalidate the content path to update the UI
    revalidatePath("/")

    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error(`Error updating ${type} with ID ${id}:`, error)
    return { success: false, error: `Failed to update ${type} with ID ${id}` }
  }
}

// Function to delete content
export async function deleteContent(type: ContentType, id: number) {
  try {
    const result = await sql`
      DELETE FROM content.${sql(type)}
      WHERE id = ${id}
      RETURNING id
    `

    // Revalidate the content path to update the UI
    revalidatePath("/")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error(`Error deleting ${type} with ID ${id}:`, error)
    return { success: false, error: `Failed to delete ${type} with ID ${id}` }
  }
}

// Function to get categories
export async function getCategories() {
  try {
    const result = await sql`
      SELECT * FROM content.categories
      ORDER BY name ASC
    `
    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching categories:", error)
    return { success: false, error: "Failed to fetch categories" }
  }
}

// Function to get recent content for dashboard
export async function getRecentContent(limit = 5) {
  try {
    // Get recent content from each content type
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

    return { success: true, data: combined }
  } catch (error) {
    console.error("Error fetching recent content:", error)
    return { success: false, error: "Failed to fetch recent content" }
  }
}

// Function to get content stats
export async function getContentStats() {
  try {
    const [newsCount, imagesCount, videosCount, audiosCount, volunteerWorkCount, pdfsCount] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM content.news`,
      sql`SELECT COUNT(*) as count FROM content.images`,
      sql`SELECT COUNT(*) as count FROM content.videos`,
      sql`SELECT COUNT(*) as count FROM content.audios`,
      sql`SELECT COUNT(*) as count FROM content.volunteer_work`,
      sql`SELECT COUNT(*) as count FROM content.pdfs`,
    ])

    return {
      success: true,
      data: {
        news: newsCount[0]?.count || 0,
        images: imagesCount[0]?.count || 0,
        videos: videosCount[0]?.count || 0,
        audios: audiosCount[0]?.count || 0,
        volunteer_work: volunteerWorkCount[0]?.count || 0,
        pdfs: pdfsCount[0]?.count || 0,
      },
    }
  } catch (error) {
    console.error("Error fetching content stats:", error)
    return { success: false, error: "Failed to fetch content stats" }
  }
}

// Function to get deployments
export async function getDeployments(limit = 5) {
  try {
    const result = await sql`
      SELECT * FROM content.deployments
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching deployments:", error)
    return { success: false, error: "Failed to fetch deployments" }
  }
}

// Function to create a deployment record
export async function createDeployment(data: any) {
  try {
    const { deployment_id, status, branch, commit_hash, commit_message, type, triggered_by } = data

    const result = await sql`
      INSERT INTO content.deployments 
      (deployment_id, status, branch, commit_hash, commit_message, type, triggered_by)
      VALUES 
      (${deployment_id}, ${status}, ${branch}, ${commit_hash}, ${commit_message}, ${type}, ${triggered_by})
      RETURNING *
    `

    // Revalidate the deployments path to update the UI
    revalidatePath("/")

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating deployment:", error)
    return { success: false, error: "Failed to create deployment" }
  }
}

// Function to seed initial data for testing
export async function seedInitialData() {
  try {
    // Create some sample news articles
    await sql`
      INSERT INTO content.news (title, content, status, slug)
      VALUES 
      ('Welcome to Our Website', 'This is our first news article. We are excited to share our news with you!', 'published', 'welcome-to-our-website'),
      ('Upcoming Events', 'Check out our upcoming events for the month of June.', 'published', 'upcoming-events'),
      ('New Features Launched', 'We have launched several new features on our website.', 'published', 'new-features-launched')
      ON CONFLICT (slug) DO NOTHING
    `

    // Create some sample images
    await sql`
      INSERT INTO content.images (title, description, file_url, status, category)
      VALUES 
      ('Company Logo', 'Our official company logo', 'https://example.com/images/logo.png', 'published', 'branding'),
      ('Team Photo', 'Photo of our team at the annual retreat', 'https://example.com/images/team.jpg', 'published', 'team'),
      ('Office Building', 'Our headquarters building', 'https://example.com/images/office.jpg', 'published', 'facilities')
      ON CONFLICT DO NOTHING
    `

    // Create a sample deployment
    await sql`
      INSERT INTO content.deployments (deployment_id, status, branch, commit_hash, commit_message, type)
      VALUES 
      ('dpl_initial', 'ready', 'main', 'a1b2c3d4', 'Initial deployment', 'Production')
      ON CONFLICT (deployment_id) DO NOTHING
    `

    return { success: true, message: "Initial data seeded successfully" }
  } catch (error) {
    console.error("Error seeding initial data:", error)
    return { success: false, error: "Failed to seed initial data" }
  }
}
