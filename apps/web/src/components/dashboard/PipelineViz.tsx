'use client';

interface ReporterData {
  name: string;
  model: string;
}

interface CompanyData {
  name: string;
  ceo: string;
  ceoModel?: string | null;
  reporters: ReporterData[];
}

interface PipelineVizProps {
  companies?: CompanyData[];
}

const COMPANY_COLORS = [
  { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.5)', text: '#a78bfa' },
  { bg: 'rgba(0,240,255,0.12)', border: 'rgba(0,240,255,0.5)', text: '#00f0ff' },
  { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.5)', text: '#22c55e' },
  { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.5)', text: '#f59e0b' },
  { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.5)', text: '#ec4899' },
  { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.5)', text: '#3b82f6' },
];

const REPORTER_COLORS = [
  '#00f0ff', '#f0c040', '#40f080', '#ff6090',
  '#f08040', '#c080ff', '#80d0ff', '#ff80b0',
  '#a0ff60', '#60b0ff', '#ffb060', '#b060ff',
];

export function PipelineViz({ companies }: PipelineVizProps) {
  if (!companies || companies.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="text-4xl mb-4 opacity-20">
          <span className="font-mono">&gt;_</span>
        </div>
        <h3 className="text-base font-semibold text-(--text-secondary) mb-2">
          No pipeline data yet
        </h3>
        <p className="text-sm text-(--text-muted) max-w-sm">
          Add companies with CEOs and reporters in Settings to see the workflow pipeline visualization here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6" style={{ scrollbarWidth: 'thin' }}>
      {/* Pipeline header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono text-green-400">PIPELINE ACTIVE</span>
        </div>
        <div className="flex-1 h-px bg-(--border-primary)" />
        <span className="text-xs font-mono text-(--text-muted)">{companies.length} {companies.length === 1 ? 'company' : 'companies'}</span>
      </div>

      {/* Company pipelines */}
      <div className="space-y-6">
        {companies.map((company, ci) => {
          const colors = COMPANY_COLORS[ci % COMPANY_COLORS.length];
          return (
            <div key={ci} className="relative">
              {/* Company row */}
              <div className="flex items-start gap-4">
                {/* Company node */}
                <div
                  className="shrink-0 w-36 rounded-xl p-3 border text-center"
                  style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                >
                  <div className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: colors.text }}>
                    Company
                  </div>
                  <div className="text-sm font-semibold text-(--text-primary) truncate">
                    {company.name}
                  </div>
                </div>

                {/* Arrow */}
                <div className="shrink-0 flex items-center self-center">
                  <div className="w-8 h-px" style={{ backgroundColor: colors.border }} />
                  <div
                    className="w-0 h-0 border-y-4 border-y-transparent border-l-[6px]"
                    style={{ borderLeftColor: colors.border }}
                  />
                </div>

                {/* CEO node */}
                <div
                  className="shrink-0 w-40 rounded-xl p-3 border text-center"
                  style={{
                    backgroundColor: 'rgba(0,240,255,0.08)',
                    borderColor: 'rgba(0,240,255,0.4)',
                  }}
                >
                  <div className="text-xs font-mono uppercase tracking-wider mb-1 text-(--accent-cyan)">
                    CEO
                  </div>
                  <div className="text-sm font-semibold text-(--text-primary) truncate">
                    {company.ceo}
                  </div>
                  {company.ceoModel && (
                    <div className="text-[10px] font-mono text-(--text-muted) truncate mt-0.5">
                      {company.ceoModel}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <div className="shrink-0 flex items-center self-center">
                  <div className="w-8 h-px bg-(--accent-cyan)/40" />
                  <div className="w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-(--accent-cyan)/40" />
                </div>

                {/* Reporters */}
                <div className="flex flex-wrap gap-2 flex-1 min-w-0">
                  {company.reporters.length === 0 ? (
                    <div className="text-xs text-(--text-muted) font-mono self-center">No reporters</div>
                  ) : (
                    company.reporters.map((reporter, ri) => {
                      const rColor = REPORTER_COLORS[(ci * 10 + ri) % REPORTER_COLORS.length];
                      return (
                        <div
                          key={ri}
                          className="rounded-lg px-3 py-2 border text-center min-w-[100px] max-w-[160px]"
                          style={{
                            backgroundColor: `${rColor}15`,
                            borderColor: `${rColor}40`,
                          }}
                        >
                          <div className="text-[10px] font-mono uppercase tracking-wider mb-0.5" style={{ color: `${rColor}99` }}>
                            Reporter
                          </div>
                          <div className="text-xs font-semibold truncate" style={{ color: rColor }}>
                            {reporter.name}
                          </div>
                          <div className="text-[10px] font-mono text-(--text-muted) truncate mt-0.5">
                            {reporter.model}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Connector line to next company */}
              {ci < companies.length - 1 && (
                <div className="ml-[72px] w-px h-4 bg-(--border-primary)/50" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-(--border-primary)/30">
        <span className="text-[10px] font-mono text-(--text-muted) uppercase tracking-wider">Flow:</span>
        <div className="flex items-center gap-1.5 text-[10px] text-(--text-muted)">
          <span className="w-2 h-2 rounded-sm bg-(--accent-purple)/60" />
          Company
        </div>
        <span className="text-(--text-muted)/30">&rarr;</span>
        <div className="flex items-center gap-1.5 text-[10px] text-(--text-muted)">
          <span className="w-2 h-2 rounded-sm bg-(--accent-cyan)/60" />
          CEO Review
        </div>
        <span className="text-(--text-muted)/30">&rarr;</span>
        <div className="flex items-center gap-1.5 text-[10px] text-(--text-muted)">
          <span className="w-2 h-2 rounded-sm bg-green-400/60" />
          Reporters Write
        </div>
      </div>
    </div>
  );
}
