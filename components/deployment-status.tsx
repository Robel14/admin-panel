import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

type DeploymentStatusProps = {
  status: "ready" | "building" | "error"
}

export function DeploymentStatus({ status }: DeploymentStatusProps) {
  switch (status) {
    case "ready":
      return (
        <div className="flex items-center gap-1.5 text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs font-medium">Ready</span>
        </div>
      )
    case "building":
      return (
        <div className="flex items-center gap-1.5 text-amber-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs font-medium">Building</span>
        </div>
      )
    case "error":
      return (
        <div className="flex items-center gap-1.5 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs font-medium">Error</span>
        </div>
      )
    default:
      return null
  }
}
