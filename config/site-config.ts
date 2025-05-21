export const siteConfig = {
  name: "HEAL",
  fullName: "Helping Ethiopia Achieve Longevity",
  description: "Helping Ethiopia Achieve Longevity through sustainable development programs",
  url: "https://my-heal-project-new-git-main-robel14s-projects.vercel.app/",
  apiEndpoint: "/api/content",
  mainNavItems: [
    { title: "HOME", href: "/" },
    { title: "ABOUT US", href: "/about-us" },
    { title: "WHERE WE WORK", href: "/where-we-work" },
    { title: "IMPACTS", href: "/impacts" },
    { title: "ANNOUNCEMENT", href: "/announcement" },
    { title: "CONTACT US", href: "/contact-us" },
  ],
  contentTypes: [
    { id: "news", label: "News", path: "/news" },
    { id: "images", label: "Images", path: "/gallery" },
    { id: "videos", label: "Videos", path: "/videos" },
    { id: "audios", label: "Audio", path: "/audio" },
    { id: "volunteer_work", label: "Volunteer Work", path: "/volunteer" },
    { id: "pdfs", label: "PDF Files", path: "/resources" },
  ],
  stats: [
    { label: "Years of Service", value: "20+" },
    { label: "Lives Impacted", value: "500K+" },
    { label: "Projects Completed", value: "120+" },
    { label: "Regional Offices", value: "15+" },
  ],
  colors: {
    primary: "#1e8e3e", // Green color from the HEAL website
    secondary: "#f5f5f5",
    accent: "#e63946",
  },
  organization: {
    name: "HEAL",
    fullName: "Helping Ethiopia Achieve Longevity",
    logo: "/logo.png", // This would be the actual logo path
    mission: "To improve the lives of Ethiopians through sustainable development programs",
    vision: "A prosperous Ethiopia where all citizens have access to basic needs and opportunities",
  },
}
