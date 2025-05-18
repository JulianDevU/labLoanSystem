import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface RecentLoansProps {
  lab: string
}

export function RecentLoans({ lab }: RecentLoansProps) {
  // This would normally fetch data from an API
  const loans = {
    physics: [
      {
        id: "PH-1001",
        beneficiary: {
          name: "Maria Garcia",
          type: "student",
          email: "m.garcia@example.com",
        },
        items: ["Oscilloscope", "Function Generator"],
        date: "2024-05-14T10:30:00",
        returnDate: "2024-05-18T16:00:00",
        status: "active",
      },
      {
        id: "PH-1002",
        beneficiary: {
          name: "James Wilson",
          type: "teacher",
          email: "j.wilson@example.com",
        },
        items: ["Laser Kit", "Optical Bench"],
        date: "2024-05-13T14:15:00",
        returnDate: "2024-05-20T12:00:00",
        status: "active",
      },
      {
        id: "PH-1003",
        beneficiary: {
          name: "Sofia Martinez",
          type: "student",
          email: "s.martinez@example.com",
        },
        items: ["Digital Multimeter"],
        date: "2024-05-12T09:45:00",
        returnDate: "2024-05-15T17:00:00",
        status: "overdue",
      },
    ],
    telecommunications: [
      {
        id: "TC-2001",
        beneficiary: {
          name: "David Chen",
          type: "student",
          email: "d.chen@example.com",
        },
        items: ["Spectrum Analyzer", "Signal Generator"],
        date: "2024-05-14T11:00:00",
        returnDate: "2024-05-21T16:00:00",
        status: "active",
      },
      {
        id: "TC-2002",
        beneficiary: {
          name: "Emily Johnson",
          type: "teacher",
          email: "e.johnson@example.com",
        },
        items: ["Network Analyzer"],
        date: "2024-05-10T13:30:00",
        returnDate: "2024-05-17T12:00:00",
        status: "active",
      },
    ],
    software: [
      {
        id: "SW-3001",
        beneficiary: {
          name: "Michael Brown",
          type: "student",
          email: "m.brown@example.com",
        },
        items: ["Development Board", "Sensor Kit"],
        date: "2024-05-14T09:00:00",
        returnDate: "2024-05-16T17:00:00",
        status: "active",
      },
      {
        id: "SW-3002",
        beneficiary: {
          name: "Sarah Davis",
          type: "student",
          email: "s.davis@example.com",
        },
        items: ["Raspberry Pi", "Arduino Kit"],
        date: "2024-05-13T10:45:00",
        returnDate: "2024-05-15T16:30:00",
        status: "overdue",
      },
      {
        id: "SW-3003",
        beneficiary: {
          name: "Robert Taylor",
          type: "teacher",
          email: "r.taylor@example.com",
        },
        items: ["VR Headset", "Graphics Tablet"],
        date: "2024-05-11T14:00:00",
        returnDate: "2024-05-18T12:00:00",
        status: "active",
      },
    ],
  }

  const currentLoans = loans[lab as keyof typeof loans]

  return (
    <div className="space-y-4">
      {currentLoans.map((loan) => (
        <div key={loan.id} className="flex items-center gap-4 rounded-lg border p-3">
          <Avatar>
            <AvatarImage src="/placeholder-user.jpg" alt={loan.beneficiary.name} />
            <AvatarFallback>{loan.beneficiary.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{loan.beneficiary.name}</p>
              <Badge variant={loan.status === "overdue" ? "destructive" : "default"}>
                {loan.status === "overdue" ? "Overdue" : "Active"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{loan.items.join(", ")}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Due: {new Date(loan.returnDate).toLocaleDateString()}</span>
              <span>•</span>
              <span>ID: {loan.id}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
