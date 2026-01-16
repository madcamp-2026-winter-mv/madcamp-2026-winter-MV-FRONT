import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, Video, Github, Book } from "lucide-react"
import Link from "next/link"

const quickLinks = [
  { icon: FileText, label: "강의 자료", href: "#", color: "text-blue-500" },
  { icon: Video, label: "녹화 영상", href: "#", color: "text-red-500" },
  { icon: Github, label: "GitHub Org", href: "#", color: "text-foreground" },
  { icon: Book, label: "위키", href: "#", color: "text-green-500" },
]

export function QuickLinks() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-primary" />
          빠른 링크
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {quickLinks.map((link) => (
            <Link key={link.label} href={link.href}>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-auto py-3 hover:bg-primary/10 hover:border-primary bg-transparent"
              >
                <link.icon className={`h-4 w-4 ${link.color}`} />
                <span className="text-sm">{link.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
