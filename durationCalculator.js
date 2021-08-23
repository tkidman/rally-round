// util for calculating ad hoc durations for plugging into manual results
const debug = require("debug")("tkidman:durationCalculator");

const { formatDuration, getDuration } = require("./src/shared");
const durationCalculator = () => {
  const duration1 = getDuration("01:11:24.233");
  // short stage 15 minutes, long stage 30 minutes
  const duration2 = getDuration("30:00.000");
  const duration3 = getDuration("07:38.464");
  const duration = duration1.subtract(duration2).add(duration3);
  debug(formatDuration(duration));
};

durationCalculator();
