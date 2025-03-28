"use client"

import { Loader } from "lucide-react"

const Loading = () => {
return (
    <div className="flex items-center justify-center min-h-screen w-full">
<Loader className="size-6 animate-spin text-muted-foreground"/>
    </div>
)
}

export default Loading