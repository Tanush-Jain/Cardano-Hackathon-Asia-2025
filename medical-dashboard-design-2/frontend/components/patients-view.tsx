"use client"

import { useState } from "react"
import { Search, Filter, UserPlus, MoreHorizontal, Eye, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const patients = [
  { id: "PX-7821", name: "Anonymous Patient", scans: 3, lastScan: "2024-01-15", status: "verified" },
  { id: "PX-7822", name: "Anonymous Patient", scans: 1, lastScan: "2024-01-14", status: "pending" },
  { id: "PX-7823", name: "Anonymous Patient", scans: 5, lastScan: "2024-01-13", status: "verified" },
  { id: "PX-7824", name: "Anonymous Patient", scans: 2, lastScan: "2024-01-12", status: "analyzing" },
  { id: "PX-7825", name: "Anonymous Patient", scans: 1, lastScan: "2024-01-11", status: "verified" },
  { id: "PX-7826", name: "Anonymous Patient", scans: 4, lastScan: "2024-01-10", status: "pending" },
]

const statusStyles: Record<string, string> = {
  verified: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  analyzing: "bg-primary/20 text-primary border-primary/30",
}

export function PatientsView() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPatients = patients.filter((p) => p.id.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage anonymized patient records</p>
        </div>
        <Button className="gap-2 glow-cyan-sm">
          <UserPlus className="w-4 h-4" />
          New Patient
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by Patient ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <Button variant="outline" size="icon" className="border-border bg-transparent">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Patient Table */}
      <div className="glass rounded-xl border border-border overflow-hidden flex-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Patient ID
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Type
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Scans
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Last Scan
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-4">
                  <span className="font-mono text-sm text-primary">{patient.id}</span>
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{patient.name}</td>
                <td className="px-4 py-4 text-sm text-foreground">{patient.scans}</td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{patient.lastScan}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${statusStyles[patient.status]}`}
                  >
                    {patient.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="gap-2">
                        <Eye className="w-4 h-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <FileText className="w-4 h-4" /> View Scans
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
