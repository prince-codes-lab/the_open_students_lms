"use client"

interface LoadingModalProps {
  message?: string
}

export function LoadingModal({ message = "Loading..." }: LoadingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-scale-in">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#DD91D0]/30 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-[#4E0942] border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-[#4E0942]">{message}</p>
            <p className="text-sm text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
