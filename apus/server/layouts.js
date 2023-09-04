const loadDefaultLayout = async (layoutsDir) => {
  try {
    const defaultLayout = await import(`${layoutsDir}/default.js`);
    return defaultLayout.default;
  } catch {
    return null;
  }
};

export default loadDefaultLayout;
