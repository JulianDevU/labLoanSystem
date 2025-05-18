import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import type { ReactNode } from "react"

interface LabFeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export function LabFeatureCard({ icon, title, description }: LabFeatureCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
