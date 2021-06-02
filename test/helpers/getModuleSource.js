module.exports = (id, stats) => {
  const { modules } = stats.toJson({ source: true });
  const module = modules.find((m) => m.name.indexOf(id) > -1);

  if (!module) {
    throw new Error('Failed to find module ' + id)
  }

  let { source } = module;

  // Todo remove after drop webpack@4 support
  source = source.replace(/\?\?.*!/g, "??[ident]!");

  return source;
};
