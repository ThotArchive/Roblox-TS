export const bundlesByName = () => {
  const bundles = new Map<string, { bundleSource: string; bundleContext: string }>();
  for (const script of Array.from(document.scripts).filter(
    script => script.dataset.bundlename != null,
  )) {
    const { bundlename, bundleSource, bundleContext } = script.dataset;
    // Scripts are filtered based on `script.dataset.bundlename` above.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    bundles.set(bundlename!, {
      bundleSource: bundleSource === "Main" ? "Master Build" : `${bundleSource} Build`,
      bundleContext: bundleContext ?? "",
    });
  }
  return bundles;
};

export const readme =
  "Master build means the official deployed build from admin site in the current environment; \n\n Validation Build means the current build is only deployed for validation (VPN users will see only); \n\n Development build is the resource from Engineer local build, depend on which AD setup in to cookie, check ConfigureWebApps.getADFromCookie(); \n\n Unknown Build might be translation string bundle or invalid ";
