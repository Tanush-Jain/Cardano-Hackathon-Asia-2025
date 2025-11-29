"use client"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n-context"
import { Code, ExternalLink, Github, Heart, Mail, Shield, Users } from "lucide-react"

const teamMembers = [
  {
    name: "R sai pranav",
    role: "Lead Developer",
    avatar: "/professional-developer-portrait.png",
    github: "pranav-error",
  },
  {
    name: "Manasi Rajesh",
    role: "AI/ML Engineer",
    avatar: "/professional-engineer-portrait-woman.jpg",
    github: "smartinez",
  },
  {
    name: "David Kim",
    role: "Blockchain Architect",
    avatar: "/professionals/architect-1.png",
    github: "dkim",
  },
  {
    name: "Emily Johnson",
    role: "Security Researcher",
    avatar: "/professional-security-researcher-portrait.jpg",
    github: "ejohnson",
  },
]

const contributions = [
  { icon: Code, label: "Core Algorithm", description: "MedSAM integration and optimization" },
  { icon: Shield, label: "ZK Proofs", description: "Midnight protocol implementation" },
  { icon: Users, label: "Community", description: "Open-source contributions welcome" },
]

export function AboutTeamView() {
  const { t } = useI18n()

  return (
    <div className="h-full overflow-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-3">{t("teamCypher")}</h1>
        <p className="text-muted-foreground leading-relaxed">
          Building privacy-preserving medical AI on Cardano. Our mission is to make advanced diagnostics accessible
          while protecting patient data through zero-knowledge cryptography.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4">
        <Button
          className="gap-2 glow-cyan-sm"
          onClick={() => window.open("https://github.com/team-cypher/aura-ai", "_blank")}
        >
          <Github className="w-4 h-4" />
          View on GitHub
          <ExternalLink className="w-3 h-3" />
        </Button>
        <Button variant="secondary" className="gap-2">
          <Heart className="w-4 h-4 text-destructive" />
          Sponsor Project
        </Button>
      </div>

      {/* Team Members */}
      <div className="glass rounded-xl p-6 border border-border/30">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Core Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="bg-secondary/30 rounded-lg p-4 text-center hover:bg-secondary/50 transition-colors group"
            >
              <img
                src={member.avatar || "/placeholder.svg"}
                alt={member.name}
                className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-border/50 group-hover:border-primary/50 transition-colors"
              />
              <h3 className="font-semibold text-foreground">{member.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
              <a
                href={`https://github.com/${member.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Github className="w-3 h-3" />@{member.github}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Contribution Areas */}
      <div className="glass rounded-xl p-6 border border-border/30">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          How to Contribute
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contributions.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 border border-primary/20">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Collaborate Section */}
      <div className="glass rounded-xl p-6 border border-primary/20 bg-primary/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">{t("collaborate")}</h2>
            <p className="text-sm text-muted-foreground">
              Interested in contributing? Join our community of developers and researchers.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="gap-2">
              <Mail className="w-4 h-4" />
              Contact Us
            </Button>
            <Button className="gap-2 glow-cyan-sm">
              <Github className="w-4 h-4" />
              Fork Repository
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "GitHub Stars", value: "1.2k" },
          { label: "Contributors", value: "24" },
          { label: "Commits", value: "892" },
          { label: "Open Issues", value: "12" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-lg p-4 text-center border border-border/30">
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
