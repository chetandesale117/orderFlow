import React from 'react';
import { Layers, ShieldCheck, Cpu, GitBranch } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 glass-card bg-surface-primary/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-text-primary">OrderFlow</span>
            </div>
            <p className="text-xs text-text-muted max-w-sm leading-relaxed">
              High-throughput event-driven microservices e-commerce platform built with Spring Boot,
              Apache Kafka, PostgreSQL, MongoDB, Redis, Docker, and React.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-status-success/10 text-status-success border border-status-success/20">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-ping" />
                All 8 microservices healthy
              </span>
            </div>
          </div>

          {/* Architecture badges */}
          <div>
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
              Core Architecture
            </h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-primary-light" />
                Saga Orchestrator
              </li>
              <li className="flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5 text-primary-light" />
                Transactional Outbox
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-light" />
                RS256 JWT & Token Rotation
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
              Observability
            </h4>
            <ul className="space-y-2 text-xs text-text-muted font-mono">
              <li>
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Grafana Dashboard (:3000)
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:9090"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Prometheus (:9090)
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:8025"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Mailpit SMTP (:8025)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <p>&copy; {new Date().getFullYear()} OrderFlow Inc. Production Microservices Architecture.</p>
          <p className="flex items-center gap-3">
            <span>Spring Boot 3.3.6</span>
            <span>&bull;</span>
            <span>React 18 + Vite</span>
            <span>&bull;</span>
            <span>Apache Kafka</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
