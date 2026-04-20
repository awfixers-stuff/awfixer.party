interface PolicyLeafBodyProps {
  /** Section label (e.g. Judicial Rules). */
  sectionTitle: string;
  /** Parent context label (e.g. State, Region / Circuit, Military). */
  parentLabel: string;
}

export function PolicyLeafBody({ sectionTitle, parentLabel }: PolicyLeafBodyProps) {
  return (
    <>
      <p className="text-sm text-muted-foreground">Last updated: April 18, 2026</p>

      <h2 id="overview">Overview</h2>
      <p>
        This page documents AWFixer Party positions on <strong>{sectionTitle}</strong> under the{' '}
        <strong>{parentLabel}</strong> policy area. Content will be expanded as positions are
        drafted and adopted.
      </p>

      <h2 id="scope">Scope</h2>
      <p>
        The scope of this policy includes how we communicate, prioritize, and act on{' '}
        {sectionTitle.toLowerCase()} within this context. Narrower or broader carve-outs will be
        noted as the document matures.
      </p>

      <h2 id="principles">Principles</h2>
      <ul>
        <li>Transparency with the communities we serve</li>
        <li>Consistency with our values and other published policies</li>
        <li>Practical guidance that can be applied and reviewed over time</li>
      </ul>

      <h2 id="next-steps">Next steps</h2>
      <p>
        Draft language, feedback cycles, and publication timelines will be added here as this
        section develops.
      </p>
    </>
  );
}
