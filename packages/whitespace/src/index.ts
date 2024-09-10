const postcssWhitespace: any = () => ({
  postcssPlugin: "postcss-whitespace",
  Comment(comment: any) {
    // Remove all comments
    comment.remove();
  },
  Declaration(decl: any) {
    if (decl.value.includes("\n")) {
      // Remove line breaks and consequent spaces
      decl.value = decl.value.replace(/\s+/g, " ");
      // Collapse whitespace around round brackets
      decl.value = decl.value.replace(/\(\s/g, "(");
      decl.value = decl.value.replace(/\s\)/g, ")");
    }
  },
  AtRule(rule: any) {
    // Remove line breaks before and after the rule
    // biome-ignore lint/performance/noDelete: <explanation>
    delete rule.raws.before;
    // biome-ignore lint/performance/noDelete: <explanation>
    delete rule.raws.after;
  },
  Rule(rule: any) {
    rule.cleanRaws();
  },
});

export default postcssWhitespace;
