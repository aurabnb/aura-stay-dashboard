import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/** Full-width skeleton used while treasury data is loading */
const TreasuryProgressSkeleton = () => (
  <Card className="w-full border-none shadow-lg">
    <CardHeader className="text-center pb-6">
      <CardTitle className="flex items-center justify-center gap-2 text-2xl">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-48" />
      </CardTitle>
      <Skeleton className="h-4 w-64 mx-auto mt-2" />
    </CardHeader>

    <CardContent className="space-y-8">
      {/* Progress bar */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Stats tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border"
          >
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-7 w-3/4 mb-1" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>

      {/* Project details + CTA */}
      <div className="bg-gray-50 p-6 rounded-xl border">
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="text-center space-y-4">
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </CardContent>
  </Card>
)

export default TreasuryProgressSkeleton
