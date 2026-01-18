import { Suspense } from "react"
import { WriteForm } from "@/components/community/write-form"

export default function WritePage() {
  return (
    <Suspense fallback={null}>
      <WriteForm />
    </Suspense>
  )
}
