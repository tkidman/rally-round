const localization = {
  en: {
    driver: "Driver"
  },
  se: {
    driver: "Förare"
  }
};

const getLocalization = () => {
  if (process.env.LOCALE && localization[process.env.LOCALE]) {
    return localization[process.env.LOCALE];
  }
  return localization.en;
};
module.exports = { getLocalization };
