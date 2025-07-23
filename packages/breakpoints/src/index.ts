import { AtRule, type Rule } from "postcss";

const cache = new WeakMap();

const postcssBreakpoints = (opts: Record<string, string>) => ({
  postcssPlugin: "postcss-breakpoints",
  Rule(rule: Rule) {
    if (rule.parent && rule.parent.type === "atrule" && (rule.parent as any).name === "breakpoints") {
      const breakpointsRule: any = rule.parent as AtRule;

      const breakpoints: any = Object.entries(opts).map(([name, value]) => ({ name, params: `(min-width: ${value})` }));

      // when we first meet a given @breakpoints at-rule
      if (!cache.has(breakpointsRule)) {
        // create the final media rules for this @breakpoints at-rule
        const medias = breakpoints.reduce(
          (breakpointsMedias: any, breakpoint: any) => {
            breakpointsMedias[breakpoint.name] = new AtRule({
              name: "media",
              params: breakpoint.params,
            });
            return breakpointsMedias;
          },
          {} as Record<string, AtRule>,
        );

        // add an entry to the cache
        cache.set(breakpointsRule, medias);

        // add final media rules after the @breakpoints at-rule
        const mediaRules = Object.values(medias).reverse();
        mediaRules.forEach((media) => {
          breakpointsRule.after(media);
        });
      }

      // move the rule itself before @breakpoints at-rule
      breakpointsRule.before(rule);

      // save clone of the rule before we modify it
      const originalRule = rule.clone();
      // clean up the extra indentation
      rule.selector = rule.selector.replace(/\n\s\s/g, "\n");
      rule.cleanRaws();

      // add breakpoint-level rules
      breakpoints.forEach((breakpoint: any) => {
        const clone = originalRule.clone();
        addPrefix(clone, breakpoint.name);
        cache.get(breakpointsRule)[breakpoint.name].append(clone);
      });

      if (breakpointsRule.nodes.length === 0) {
        breakpointsRule.remove();
        cache.delete(breakpointsRule);
      }
    }
  },
});

postcssBreakpoints.postcss = true;

export default postcssBreakpoints;

function addPrefix(node: any, prefix: string) {
  if (node.type === "atrule") {
    (node as any).each((child: any) => addPrefix(child, prefix));
  }

  /**
   * Should match responsive classes (rt-r- prefix):
   * ```
   * .rt-r-size-1
   * .rt-m-2
   * .-rt-m-2
   * .rt-Button.rt-r-size-1 (captures "rt-r-size-1")
   * ```
   *
   * Should not match:
   * .rt-Button
   */
  const classNameRegexp = /\.(-?rt-r-[a-z0-9-]+)/g;

  // Check for rules that use compound props on a component:
  // - a component name (prefixed with "rt-" and pascal cased)
  // - followed by 2 or more prop selectors (lowercase, numbers, -)
  //
  // e.g. ".rt-DialogContent.rt-r-size-2.gray"
  if (/\.rt-(?:[A-Z][a-z]+)+(?:\.[a-z0-9-]+){2,}/.test((node as any).selector)) {
    throw Error(`
      "${(node as any).selector}" looks like it uses compound props on a component.
      "@breakpoints" does not support compound props yet.
    `);
  }

  if (classNameRegexp.test((node as any).selector)) {
    (node as any).selector = (node as any).selector.replace(classNameRegexp, `.${prefix}\\:$1`);
  }
}
