import { siteConfig } from "@/config/site-config"
import type { ContentType } from "@/app/actions/content"

// Function to fetch content from the website
export async function fetchWebsiteContent(type?: ContentType, id?: number, limit = 10) {
  try {
    let url = `${siteConfig.url}${siteConfig.apiEndpoint}?limit=${limit}`

    if (type) {
      url += `&type=${type}`
    }

    if (id) {
      url += `&id=${id}`
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching website content:", error)
    return { success: false, error: "Failed to fetch website content" }
  }
}

// Function to push content to the website
export async function pushContentToWebsite(type: ContentType, data: any) {
  try {
    const response = await fetch(`${siteConfig.url}${siteConfig.apiEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, data }),
    })

    if (!response.ok) {
      throw new Error(`Failed to push content: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error pushing content to website:", error)
    return { success: false, error: "Failed to push content to website" }
  }
}

// Function to trigger a website deployment
export async function triggerWebsiteDeployment() {
  try {
    // In a real implementation, this would call the Vercel API to trigger a deployment
    // For now, we'll simulate a successful deployment
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return { success: true, message: "Website deployment triggered successfully" }
  } catch (error) {
    console.error("Error triggering website deployment:", error)
    return { success: false, error: "Failed to trigger website deployment" }
  }
}
